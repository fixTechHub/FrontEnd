import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Row,
  Col,
  Tag,
  message,
  Space,
  Modal,
  Descriptions,
  Divider
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined as EditIcon,
  ReloadOutlined
} from '@ant-design/icons';
import { financialReportAPI } from '../../features/financialReport/financialReportAPI';
import {
  fetchFinancialSummary,
  fetchAllBookingsFinancial,
  fetchAllTechniciansFinancialSummary,
  fetchTechnicianFinancialDetails,
  fetchBookingsByTechnicianId,
  clearError,
  setSelectedTechnicianId,
  clearSelectedTechnician
} from '../../features/financialReport/financialReportSlice';
// Import APIs để lấy tên thực
import { userAPI } from '../../features/users/userAPI';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const { Option } = Select;

const FinancialManagement = () => {
  const dispatch = useDispatch();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [isTechnicianModalVisible, setIsTechnicianModalVisible] = useState(false);
  // Không cần userMap, technicianMap, serviceMap nữa vì backend đã cung cấp names
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('bookings');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Redux selectors
  const financialSummary = useSelector(state => state.financialReport.financialSummary);
  const bookingsFinancial = useSelector(state => state.financialReport.bookingsFinancial);
  const techniciansFinancialSummary = useSelector(state => state.financialReport.techniciansFinancialSummary);
  const loading = useSelector(state => state.financialReport.loading);
  const error = useSelector(state => state.financialReport.error);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Financial Management State:', {
      financialSummary,
      bookingsFinancial: bookingsFinancial?.length || 0,
      techniciansFinancialSummary: techniciansFinancialSummary?.length || 0,
      loading,
      error,
      activeTab
    });
  }, [financialSummary, bookingsFinancial, techniciansFinancialSummary, loading, error, activeTab]);

  // Local loading states cho từng loại dữ liệu
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [techniciansLoading, setTechniciansLoading] = useState(false);
  
  // Maps để lưu tên thực từ ID
  const [technicianNameMap, setTechnicianNameMap] = useState({});
  const [customerNameMap, setCustomerNameMap] = useState({});
  const [userMap, setUserMap] = useState({});

  const {
    totalRevenue = 0,
    totalHoldingAmount = 0,
    totalCommissionAmount = 0,
    totalTechnicianEarning = 0,
    totalWithdrawn = 0
  } = financialSummary || {};

  // Tạo mapping từ technician ID sang tên
  useEffect(() => {
    if (techniciansFinancialSummary.length > 0) {
      const techMap = {};
      console.log('🔍 Creating technician mapping from technicians:', techniciansFinancialSummary);
      techniciansFinancialSummary.forEach(tech => {
        if (tech.technicianId) {
          // Kiểm tra tất cả các trường có thể chứa tên technician
          const technicianName = tech.technicianName || 
                                tech.fullName || 
                                tech.name ||
                                tech.technician?.fullName ||
                                tech.technician?.name ||
                                'Không có tên';
          techMap[tech.technicianId] = technicianName;
          console.log(`🔍 Technician mapping: ${tech.technicianId} -> ${technicianName}`);
        }
      });
      setTechnicianNameMap(techMap);
    }
  }, [techniciansFinancialSummary]);

  // Tạo userMap từ userAPI.getAll() giống như BookingManagement
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userAPI.getAll();
        const userMapData = {};
        users.forEach(u => userMapData[u.id] = u.fullName || u.email);
        setUserMap(userMapData);
        console.log('✅ UserMap created successfully:', userMapData);
      } catch (error) {
        console.error('❌ Failed to fetch users:', error);
      }
    };
    
    fetchUsers();
  }, []);

  // Tạo mapping từ customer ID sang tên (sử dụng userMap)
  useEffect(() => {
    if (Object.keys(userMap).length > 0 && bookingsFinancial.length > 0) {
      const custMap = {};
      console.log('🔍 Creating customer mapping using userMap:', userMap);
      
      bookingsFinancial.forEach(booking => {
        if (booking.customerId && !custMap[booking.customerId]) {
          // Sử dụng userMap trước, fallback về dữ liệu có sẵn
          const customerName = userMap[booking.customerId] || 
                             booking.customerName || 
                             booking.customer?.fullName || 
                             booking.customer?.name ||
                             `Khách hàng ${booking.customerId}`;
          custMap[booking.customerId] = customerName;
          console.log(`🔍 Customer mapping: ${booking.customerId} -> ${customerName}`);
        }
      });
      
      setCustomerNameMap(custMap);
    }
  }, [userMap, bookingsFinancial]);

  // Debug logging cho mapping
  useEffect(() => {
    console.log('🔍 Mapping State:', {
      userMap,
      technicianNameMap,
      customerNameMap,
      sampleUser: Object.keys(userMap)[0],
      sampleTechnician: Object.keys(technicianNameMap)[0],
      sampleCustomer: Object.keys(customerNameMap)[0]
    });
    
    // Debug chi tiết dữ liệu
    if (bookingsFinancial.length > 0) {
      console.log('🔍 Sample booking data:', bookingsFinancial[0]);
      console.log('🔍 Available fields in booking:', Object.keys(bookingsFinancial[0]));
    }
    
    if (techniciansFinancialSummary.length > 0) {
      console.log('🔍 Sample technician data:', techniciansFinancialSummary[0]);
      console.log('🔍 Available fields in technician:', Object.keys(techniciansFinancialSummary[0]));
    }
  }, [userMap, technicianNameMap, customerNameMap, bookingsFinancial, techniciansFinancialSummary]);

  // Load financial data on component mount
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        // Chỉ load summary trước, các dữ liệu khác sẽ load khi cần
        dispatch(fetchFinancialSummary());
        
        // Lazy load các dữ liệu lớn chỉ khi user thực sự cần
        // dispatch(fetchAllBookingsFinancial());
        // dispatch(fetchAllTechniciansFinancialSummary());
      } catch (error) {
        message.error('Failed to load financial data');
      }
    };

    fetchFinancialData();
  }, [dispatch]);

  // Load bookings data chỉ khi tab được chọn
  useEffect(() => {
    if (activeTab === 'bookings' && bookingsFinancial.length === 0) {
      console.log('🔍 Loading bookings data...');
      setBookingsLoading(true);
      dispatch(fetchAllBookingsFinancial())
        .then((result) => {
          console.log('✅ Bookings loaded successfully:', result);
        })
        .catch((error) => {
          console.error('❌ Error loading bookings:', error);
        })
        .finally(() => {
          setBookingsLoading(false);
        });
    }
  }, [activeTab, bookingsFinancial.length, dispatch]);

  // Load technicians data chỉ khi tab được chọn
  useEffect(() => {
    if (activeTab === 'technicians' && techniciansFinancialSummary.length === 0) {
      setTechniciansLoading(true);
      dispatch(fetchAllTechniciansFinancialSummary())
        .finally(() => setTechniciansLoading(false));
    }
  }, [activeTab, techniciansFinancialSummary.length, dispatch]);

  // Cập nhật export data khi component mount và khi data thay đổi
  useEffect(() => {
    if (bookingsFinancial.length > 0 || techniciansFinancialSummary.length > 0) {
      handleExport();
    }
  }, [bookingsFinancial, techniciansFinancialSummary, activeTab]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      // Clear export data khi rời khỏi trang
      if (window.currentPageExportData && 
          (window.currentPageExportData.fileName === 'financial_bookings_export' || 
           window.currentPageExportData.fileName === 'financial_technicians_export')) {
        delete window.currentPageExportData;
      }
    };
  }, []);

  // Sử dụng data từ backend thay vì fetch riêng
  // Backend đã cung cấp CustomerName, TechnicianName, ServiceName trong DTO

  useEffect(() => {
    if (error) {
      // Kiểm tra nếu error là object thì lấy message, nếu không thì dùng error trực tiếp
      const errorMessage = typeof error === 'object' && error.message ? error.message : String(error);
      message.error(errorMessage);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Reset filters và phân trang khi chuyển tab
  useEffect(() => {
    setSearchText('');
    setStatusFilter('');
    setPaymentFilter('');
    setCurrentPage(1); // Reset về trang đầu tiên
  }, [activeTab]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter, paymentFilter]);

  // Logic filter và phân trang
  const filteredBookings = bookingsFinancial.filter(booking => {
    const matchesSearch = !searchText || 
      booking.bookingCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.technicianName?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.serviceName?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    const matchesPayment = !paymentFilter || booking.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const filteredTechnicians = techniciansFinancialSummary.filter(technician => {
    const matchesSearch = !searchText || 
      technician.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      technician.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      technician.phone?.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesSearch;
  });

  // Sắp xếp data
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'finalPrice') {
      return sortOrder === 'asc' ? (a.finalPrice || 0) - (b.finalPrice || 0) : (b.finalPrice || 0) - (a.finalPrice || 0);
    } else if (sortField === 'commissionAmount') {
      return sortOrder === 'asc' ? (a.commissionAmount || 0) - (b.commissionAmount || 0) : (b.commissionAmount || 0) - (a.commissionAmount || 0);
    }
    return 0;
  });

  const sortedTechnicians = [...filteredTechnicians].sort((a, b) => {
    if (sortField === 'totalRevenue') {
      return sortOrder === 'asc' ? (a.totalRevenue || 0) - (b.totalRevenue || 0) : (b.totalRevenue || 0) - (a.totalRevenue || 0);
    } else if (sortField === 'totalBookings') {
      return sortOrder === 'asc' ? (a.totalBookings || 0) - (b.totalBookings || 0) : (b.totalBookings || 0) - (a.totalBookings || 0);
    }
    return 0;
  });

  // Phân trang
  const indexOfLastBooking = currentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const indexOfLastTechnician = currentPage * itemsPerPage;
  const indexOfFirstTechnician = indexOfLastTechnician - itemsPerPage;
  
  const currentBookings = sortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const currentTechnicians = sortedTechnicians.slice(indexOfFirstTechnician, indexOfLastTechnician);
  
  const totalBookingsPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const totalTechniciansPages = Math.ceil(sortedTechnicians.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'payment') {
      setPaymentFilter(value);
    }
    setCurrentPage(1); // Reset về trang đầu tiên khi filter
  };

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setPaymentFilter('');
    setCurrentPage(1); // Reset về trang đầu tiên khi clear filter
  };

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsBookingModalVisible(true);
  };

  const handleViewTechnicianDetails = (technicianId) => {
    try {
      
      // Tìm technician từ data có sẵn
      const technician = techniciansFinancialSummary.find(t => t.technicianId === technicianId);
      
      if (!technician) {
        message.error('Technician not found in current data');
        return;
      }

      // Tạo object technician details từ data có sẵn
      const technicianDetails = {
        id: technician.technicianId,
        technicianId: technician.technicianId,
        technicianName: technician.technicianName,
        totalEarning: technician.totalEarning,
        totalCommissionPaid: technician.totalCommissionPaid,
        totalHoldingAmount: technician.totalHoldingAmount,
        totalWithdrawn: technician.totalWithdrawn,
        totalBookings: technician.totalBookings
      };

      // Tìm bookings của technician này từ data có sẵn
      const technicianBookings = bookingsFinancial.filter(b => b.technicianId === technicianId);
      
      
      setSelectedTechnician({ ...technicianDetails, bookings: technicianBookings });
      setIsTechnicianModalVisible(true);
    } catch (error) {
      console.error('Error viewing technician details:', error);
      message.error('Failed to view technician details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
        return 'orange';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };

  const getPaymentColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'PAID':
        return 'green';
      case 'PENDING':
        return 'orange';
      case 'FAILED':
        return 'red';
      default:
        return 'default';
    }
  };

  // Helper function để format status và payment status
  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ') || status;
  };

  const handleSortChange = (value) => {
    if (value === 'lasted') {
      setSortField('createdAt');
      setSortOrder('desc');
    } else if (value === 'oldest') {
      setSortField('createdAt');
      setSortOrder('asc');
    }
  };

  // Sort functions cho technician
  const handleSortByTechnicianName = () => {
    if (sortField === 'technicianName') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('technicianName');
      setSortOrder('asc');
    }
  };

  const handleSortByTotalEarning = () => {
    if (sortField === 'totalEarning') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('totalEarning');
      setSortOrder('asc');
    }
  };

  const handleSortByCommissionPaid = () => {
    if (sortField === 'totalCommissionPaid') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('totalCommissionPaid');
      setSortOrder('asc');
    }
  };

  const handleSortByHoldingAmount = () => {
    if (sortField === 'totalHoldingAmount') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('totalHoldingAmount');
      setSortOrder('asc');
    }
  };

  const handleSortByWithdrawn = () => {
    if (sortField === 'totalWithdrawn') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('totalWithdrawn');
      setSortOrder('asc');
    }
  };

  const handleSortByTotalBookings = () => {
    if (sortField === 'totalBookings') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('totalBookings');
      setSortOrder('asc');
    }
  };

  // Sort functions cho booking
  const handleSortByBookingCode = () => {
    if (sortField === 'bookingCode') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('bookingCode');
      setSortOrder('asc');
    }
  };

  const handleSortByFinalPrice = () => {
    if (sortField === 'finalPrice') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('finalPrice');
      setSortOrder('asc');
    }
  };

  const handleSortByBookingHoldingAmount = () => {
    if (sortField === 'holdingAmount') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('holdingAmount');
      setSortOrder('asc');
    }
  };

  const handleSortByCommissionAmount = () => {
    if (sortField === 'commissionAmount') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('commissionAmount');
      setSortOrder('asc');
    }
  };

  const handleSortByTechnicianEarning = () => {
    if (sortField === 'technicianEarning') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField('technicianEarning');
      setSortOrder('asc');
    }
  };

  // Export functionality
  const handleExport = () => {
    // Set export data for AdminHeader
    if (activeTab === 'bookings') {
      window.currentPageExportData = {
        data: filteredBookings.map(booking => ({
          'Booking Code': booking.bookingCode,
          'Customer Name': booking.customerName,
          'Technician Name': booking.technicianName,
          'Service Name': booking.serviceName,
          'Final Price': formatCurrency(booking.finalPrice),
          'Holding Amount': formatCurrency(booking.holdingAmount),
          'Commission Amount': formatCurrency(booking.commissionAmount),
          'Technician Earning': formatCurrency(booking.technicianEarning),
          'Status': booking.status,
          'Payment Status': booking.paymentStatus,
          'Created Date': formatDate(booking.createdAt)
        })),
        columns: [
          { title: 'Booking Code', dataIndex: 'Booking Code' },
          { title: 'Customer Name', dataIndex: 'Customer Name' },
          { title: 'Technician Name', dataIndex: 'Technician Name' },
          { title: 'Service Name', dataIndex: 'Service Name' },
          { title: 'Final Price', dataIndex: 'Final Price' },
          { title: 'Holding Amount', dataIndex: 'Holding Amount' },
          { title: 'Commission Amount', dataIndex: 'Commission Amount' },
          { title: 'Technician Earning', dataIndex: 'Technician Earning' },
          { title: 'Status', dataIndex: 'Status' },
          { title: 'Payment Status', dataIndex: 'Payment Status' },
          { title: 'Created Date', dataIndex: 'Created Date' }
        ],
        fileName: 'financial_bookings_export',
        sheetName: 'Financial Bookings'
      };
    } else {
      window.currentPageExportData = {
        data: filteredTechnicians.map(technician => ({
          'Technician ID': technician.technicianId,
          'Technician Name': technician.technicianName,
          'Total Bookings': technician.totalBookings,
          'Total Earning': formatCurrency(technician.totalEarning),
          'Commission Paid': formatCurrency(technician.totalCommissionPaid),
          'Holding Amount': formatCurrency(technician.totalHoldingAmount),
          'Withdrawn': formatCurrency(technician.totalWithdrawn)
        })),
        columns: [
          { title: 'Technician ID', dataIndex: 'Technician ID' },
          { title: 'Technician Name', dataIndex: 'Technician Name' },
          { title: 'Total Bookings', dataIndex: 'Total Bookings' },
          { title: 'Total Earning', dataIndex: 'Total Earning' },
          { title: 'Commission Paid', dataIndex: 'Commission Paid' },
          { title: 'Holding Amount', dataIndex: 'Holding Amount' },
          { title: 'Withdrawn', dataIndex: 'Withdrawn' }
        ],
        fileName: 'financial_technicians_export',
        sheetName: 'Financial Technicians'
      };
    }
    
    // Trigger export from AdminHeader
    const exportButton = document.querySelector('button[onclick*="handleExportExcel"]');
    if (exportButton) {
      exportButton.click();
    }
  };



  const bookingColumns = [
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByBookingCode}>
          Mã đơn hàng
          {sortField === 'bookingCode' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      width: 180,
      render: (text) => (
        <div style={{ maxWidth: 180, fontWeight: 500 }}>
          {text?.length > 20 ? `${text.substring(0, 20)}...` : text}
        </div>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByFinalPrice}>
          Giá trị đơn hàng
          {sortField === 'finalPrice' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      width: 120,
      render: (price) => (
        <span style={{ fontWeight: 600, color: '#52c41a' }}>
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByBookingHoldingAmount}>
          Số tiền giữ lại
          {sortField === 'holdingAmount' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'holdingAmount',
      key: 'holdingAmount',
      width: 120,
      render: (amount) => (
        <span style={{ fontWeight: 600, color: '#faad14' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByTechnicianEarning}>
          Kỹ thuật viên nhận được
          {sortField === 'technicianEarning' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'technicianEarning',
      key: 'technicianEarning',
      width: 150,
      render: (earning) => (
        <span style={{ fontWeight: 600, color: '#722ed1' }}>
          {formatCurrency(earning)}
        </span>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (paymentStatus) => (
        <Tag color={getPaymentColor(paymentStatus)}>
          {formatStatus(paymentStatus)?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button className="management-action-btn" size="middle" onClick={() => handleViewBookingDetails(record)}>
            <EyeOutlined style={{marginRight: 4}} />Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const technicianColumns = [
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByTechnicianName}>
          Họ và tên
          {sortField === 'technicianName' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'technicianName',
      key: 'technicianName',
      render: (name) => (
        <div style={{ maxWidth: 200, fontWeight: 500 }}>
          {name?.length > 30 ? `${name.substring(0, 30)}...` : name}
        </div>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByTotalEarning}>
          Tổng thu nhập
          {sortField === 'totalEarning' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'totalEarning',
      key: 'totalEarning',
      render: (earning) => (
        <span style={{ fontWeight: 600, color: '#52c41a' }}>
          {formatCurrency(earning)}
        </span>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByHoldingAmount}>
          Số tiền giữ lại
          {sortField === 'totalHoldingAmount' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'totalHoldingAmount',
      key: 'totalHoldingAmount',
      render: (amount) => (
        <span style={{ fontWeight: 600, color: '#faad14' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByWithdrawn}>
          Đã rút
          {sortField === 'totalWithdrawn' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'totalWithdrawn',
      key: 'totalWithdrawn',
      render: (withdrawn) => (
        <span style={{ fontWeight: 600, color: '#722ed1' }}>
          {formatCurrency(withdrawn)}
        </span>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByTotalBookings}>
          Tổng đơn hàng
          {sortField === 'totalBookings' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'totalBookings',
      key: 'totalBookings',
      render: (count) => (
        <Tag color="blue" style={{ fontWeight: 600 }}>
          {count}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button className="management-action-btn" size="middle" onClick={() => handleViewTechnicianDetails(record.technicianId)}>
            <EyeOutlined style={{marginRight: 4}} />Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];



  return (
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
        <Card>
          {/* Stats Cards */}
          <Row gutter={[12, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card style={{ 
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '90px'
                }}>
                  <h5 style={{ 
                    fontSize: '13px', 
                    margin: '0 0 8px 0', 
                    color: '#666',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>Tổng giá trị đơn hàng</h5>
                  <h3 style={{ 
                    color: '#1890ff', 
                    margin: 0, 
                    fontSize: '18px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap'
                  }}>{formatCurrency(totalRevenue)}</h3>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ 
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '90px'
                }}>
                  <h5 style={{ 
                    fontSize: '13px', 
                    margin: '0 0 8px 0', 
                    color: '#666',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>Tổng số tiền giữ lại</h5>
                  <h3 style={{ 
                    color: '#faad14', 
                    margin: 0, 
                    fontSize: '18px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap'
                  }}>{formatCurrency(totalHoldingAmount)}</h3>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ 
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '90px'
                }}>
                  <h5 style={{ 
                    fontSize: '13px', 
                    margin: '0 0 8px 0', 
                    color: '#666',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>Tổng thu nhập kỹ thuật viên</h5>
                  <h3 style={{ 
                    color: '#722ed1', 
                    margin: 0, 
                    fontSize: '18px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap'
                  }}>{formatCurrency(totalTechnicianEarning)}</h3>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ 
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '90px'
                }}>
                  <h5 style={{ 
                    fontSize: '13px', 
                    margin: '0 0 8px 0', 
                    color: '#666',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>Tổng số tiền đã rút</h5>
                  <h3 style={{ 
                    color: '#f5222d', 
                    margin: 0, 
                    fontSize: '18px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap'
                  }}>{formatCurrency(totalWithdrawn)}</h3>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Filter Controls */}
          <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
            <div className="d-flex align-items-center gap-2">
              <div className="top-search">
                <div className="top-search-group">
                  <span className="input-icon">
                    <i className="ti ti-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={activeTab === 'bookings' ? "Tìm mã đơn hàng, tên người dùng, mã kỹ thuật viên" : "Tìm tên, ID kỹ thuật viên"}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
              {activeTab === 'bookings' && (
                <>
                  <Select
                    placeholder="Trạng thái"
                    style={{ width: 130 }}
                    allowClear
                    value={statusFilter || undefined}
                    onChange={(value) => setStatusFilter(value)}
                  >
                    <Option value="PENDING">PENDING</Option>
                    <Option value="CONFIRMED">CONFIRMED</Option>
                    <Option value="IN_PROGRESS">IN PROGRESS</Option>
                    <Option value="AWAITING_DONE">AWAITING DONE</Option>
                    <Option value="WAITING_CONFIRM">WAITING CONFIRM</Option>
                    <Option value="CONFIRM_ADDITIONAL">CONFIRM ADDITIONAL</Option>
                    <Option value="DONE">DONE</Option>
                    <Option value="CANCELLED">CANCELLED</Option>
                    <Option value="WAITING_CUSTOMER_CONFIRM_ADDITIONAL">WAITING CUSTOMER CONFIRM ADDITIONAL</Option>
                    <Option value="WAITING_TECHNICIAN_CONFIRM_ADDITIONAL">WAITING TECHNICIAN CONFIRM ADDITIONAL</Option>
                  </Select>
                  <Select
                    placeholder="Thanh toán"
                    style={{ width: 130 }}
                    allowClear
                    value={paymentFilter || undefined}
                    onChange={(value) => setPaymentFilter(value)}
                  >
                    <Option value="PENDING">PENDING</Option>
                    <Option value="PAID">PAID</Option>
                    <Option value="FAILED">FAILED</Option>
                    <Option value="CANCELLED">CANCELLED</Option>
                    <Option value="REFUNDED">REFUNDED</Option>
                  </Select>
                </>
              )}
            </div>
            <div className="d-flex align-items-center" style={{ gap: 12 }}>
              <span className="sort-label" style={{ marginRight: 8, fontWeight: 500, color: '#222', fontSize: 15 }}>Sắp xếp:</span>
              <Select
                value={sortField === 'createdAt' && sortOrder === 'desc' ? 'lasted' : 'oldest'}
                style={{ width: 120 }}
                onChange={handleSortChange}
                options={[
                  { value: 'lasted', label: 'Mới nhất' },
                  { value: 'oldest', label: 'Cũ nhất' },
                ]}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-3">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('bookings')}
              >
                Đơn hàng
              </button>
              <button
                type="button"
                className={`btn ${activeTab === 'technicians' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('technicians')}
              >
                Kỹ thuật viên
              </button>
            </div>
          </div>

          {/* Content Tables */}
          {activeTab === 'bookings' && (
            <>
              <Table
                columns={bookingColumns}
                dataSource={currentBookings}
                rowKey="id"
                loading={loading || bookingsLoading}
                pagination={false}
                scroll={{ x: 1200 }}
                size="middle"
                style={{ marginTop: 16 }}
              />
              
              {/* Pagination controls cho bookings */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="text-muted">
                    Hiển thị {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, sortedBookings.length)} trong tổng số {sortedBookings.length} bookings
                  </div>
                </div>
                {totalBookingsPages > 1 && (
                  <nav>
                    <ul className="pagination mb-0" style={{ gap: '2px' }}>
                      {/* Previous button */}
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          style={{ 
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            minWidth: '40px'
                          }}
                        >
                          <i className="ti ti-chevron-left"></i>
                        </button>
                      </li>
                      
                      {/* Page numbers */}
                      {[...Array(totalBookingsPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        // Show first page, last page, current page, and pages around current page
                        if (
                          pageNumber === 1 || 
                          pageNumber === totalBookingsPages || 
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <li key={i} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(pageNumber)}
                                style={{ 
                                  border: '1px solid #dee2e6',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  minWidth: '40px',
                                  backgroundColor: currentPage === pageNumber ? '#007bff' : 'white',
                                  color: currentPage === pageNumber ? 'white' : '#007bff',
                                  borderColor: currentPage === pageNumber ? '#007bff' : '#dee2e6'
                                }}
                              >
                                {pageNumber}
                              </button>
                            </li>
                          );
                        } else if (
                          pageNumber === currentPage - 2 || 
                          pageNumber === currentPage + 2
                        ) {
                          return (
                            <li key={i} className="page-item disabled">
                              <span className="page-link" style={{ 
                                border: '1px solid #dee2e6',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                minWidth: '40px',
                                backgroundColor: '#f8f9fa',
                                color: '#6c757d'
                              }}>...</span>
                            </li>
                          );
                        }
                        return null;
                      })}
                      
                      {/* Next button */}
                      <li className={`page-item ${currentPage === totalBookingsPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalBookingsPages}
                          style={{ 
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            minWidth: '40px'
                          }}
                        >
                          <i className="ti ti-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </>
          )}

          {activeTab === 'technicians' && (
            <>
              <Table
                columns={technicianColumns}
                dataSource={currentTechnicians}
                rowKey="technicianId"
                loading={loading || techniciansLoading}
                pagination={false}
                scroll={{ x: 1200 }}
                size="middle"
                style={{ marginTop: 16 }}
              />
              
              {/* Pagination Info and Controls */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="text-muted">
                    Hiển thị {indexOfFirstTechnician + 1}-{Math.min(indexOfLastTechnician, sortedTechnicians.length)} trong tổng số {sortedTechnicians.length} technicians
                  </div>
                  <div className="text-muted">
                    Trang {currentPage} / {Math.max(1, totalTechniciansPages)}
                  </div>
                </div>
                {sortedTechnicians.length > 0 && (
                  <nav>
                    <ul className="pagination mb-0" style={{ gap: '2px' }}>
                      {/* Previous button */}
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          style={{ 
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            minWidth: '40px'
                          }}
                        >
                          <i className="ti ti-chevron-left"></i>
                        </button>
                      </li>
                      
                      {/* Page numbers */}
                      {[...Array(Math.max(1, totalTechniciansPages))].map((_, i) => {
                        const pageNumber = i + 1;
                        // Always show at least page 1
                        if (totalTechniciansPages <= 1) {
                          return (
                            <li key={i} className="page-item active">
                              <button 
                                className="page-link" 
                                style={{ 
                                  border: '1px solid #007bff',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  minWidth: '40px',
                                  backgroundColor: '#007bff',
                                  color: 'white',
                                  borderColor: '#007bff'
                                }}
                              >
                                1
                              </button>
                            </li>
                          );
                        }
                        
                        // Show first page, last page, current page, and pages around current page
                        if (
                          pageNumber === 1 || 
                          pageNumber === totalTechniciansPages || 
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <li key={i} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(pageNumber)}
                                style={{ 
                                  border: '1px solid #dee2e6',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  minWidth: '40px',
                                  backgroundColor: currentPage === pageNumber ? '#007bff' : 'white',
                                  color: currentPage === pageNumber ? 'white' : '#007bff',
                                  borderColor: currentPage === pageNumber ? '#007bff' : '#dee2e6'
                                }}
                              >
                                {pageNumber}
                              </button>
                            </li>
                          );
                        } else if (
                          pageNumber === currentPage - 2 || 
                          pageNumber === currentPage + 2
                        ) {
                          return (
                            <li key={i} className="page-item disabled">
                              <span className="page-link" style={{ 
                                border: '1px solid #dee2e6',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                minWidth: '40px',
                                backgroundColor: '#f8f9fa',
                                color: '#6c757d'
                              }}>...</span>
                            </li>
                          );
                        }
                        return null;
                      })}
                      
                      {/* Next button */}
                      <li className={`page-item ${currentPage === Math.max(1, totalTechniciansPages) ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.max(1, totalTechniciansPages)}
                          style={{ 
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            minWidth: '40px'
                          }}
                        >
                          <i className="ti ti-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </>
          )}
        </Card>

        {/* Booking Details Modal */}
        {isBookingModalVisible && selectedBooking && (
          <Modal
            open={isBookingModalVisible}
            onCancel={() => setIsBookingModalVisible(false)}
            footer={null}
            title={null}
            width={960}
            styles={{ body: { padding: 0 } }}
          >
            <div style={{ background: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 24, color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>Chi tiết đơn hàng</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Mã đơn hàng: {selectedBooking.bookingCode || selectedBooking.id}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Trạng thái thanh toán: </span>
                    <Tag color={getPaymentColor(selectedBooking.paymentStatus)} style={{ fontSize: 12, fontWeight: 600 }}>
                      {selectedBooking.paymentStatus ? selectedBooking.paymentStatus.replace(/_/g, ' ') : ''}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: 24 }}>
                <Row gutter={16}>
                  {/* Financial Overview */}
                  <Col span={12}>
                    <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                      <div style={{ fontWeight: 600, marginBottom: 12 }}>Tổng quan tài chính</div>
                      <Descriptions size="small" column={1} bordered={false}
                        items={[
                          { key: 'createdAt', label: 'Ngày tạo', children: selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString('vi-VN') : 'Chưa có' },
                          { key: 'status', label: 'Trạng thái', children: selectedBooking.status || 'Chưa có' },
                        ]}
                      />
                    </div>
                  </Col>
                  {/* People */}
                  <Col span={12}>
                    <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                      <div style={{ fontWeight: 600, marginBottom: 12 }}>Thông tin đơn hàng</div>
                      <Descriptions size="small" column={1} bordered={false}
                        items={[
                          { key: 'customer', label: 'Khách hàng', children: userMap[selectedBooking.customerId] || selectedBooking.customerId || 'Chưa có' },
                          { key: 'technician', label: 'Kỹ thuật viên', children: technicianNameMap[selectedBooking.technicianId] || selectedBooking.technicianId || 'Chưa có' },
                        ]}
                      />
                    </div>
                  </Col>
                </Row>

                <Divider style={{ margin: '16px 0' }} />

                {/* Financial Details */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Chi tiết tài chính</div>
                  <Row gutter={12}>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', background: '#f6ffed', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Giá trị đơn hàng</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#52c41a' }}>{formatCurrency(selectedBooking.finalPrice)}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', background: '#fffbe6', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Số tiền giữ lại</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#faad14' }}>{formatCurrency(selectedBooking.holdingAmount)}</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', background: '#f9f0ff', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Thu nhập KTV</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#722ed1' }}>{formatCurrency(selectedBooking.technicianEarning)}</div>
                      </div>
                    </Col>
                  </Row>
                </div>
                
              </div>
            </div>
          </Modal>
        )}

        {/* Technician Details Modal */}
        {isTechnicianModalVisible && selectedTechnician && (
          <Modal
            open={isTechnicianModalVisible}
            onCancel={() => setIsTechnicianModalVisible(false)}
            footer={null}
            title={null}
            width={960}
            styles={{ body: { padding: 0 } }}
          >
            <div style={{ background: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 24, color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>Chi tiết tài chính kỹ thuật viên</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>ID: {selectedTechnician.technicianId}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Tag color="blue" style={{ fontSize: 14, fontWeight: 600 }}>
                    {selectedTechnician.technicianName || selectedTechnician.technicianId}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: 24 }}>
                {/* Financial Details Cards */}

                {/* Performance Summary */}
                <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Tóm tắt hiệu suất</div>
                  <Row gutter={16}>
                    <Col span={6}>
                      <div style={{ textAlign: 'center', padding: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#1890ff' }}>{selectedTechnician.totalBookings}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>Tổng đơn hàng</div>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{ textAlign: 'center', padding: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{formatCurrency(selectedTechnician.totalEarning)}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>Tổng thu nhập</div>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{ textAlign: 'center', padding: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#666' }}>{formatCurrency(selectedTechnician.totalHoldingAmount)}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>Số tiền giữ lại</div>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div style={{ textAlign: 'center', padding: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#722ed1' }}>{formatCurrency(selectedTechnician.totalWithdrawn)}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>Đã rút</div>
                      </div>
                    </Col>
                  </Row>
                </div>
                
                {/* Booking History */}
                {selectedTechnician.bookings && selectedTechnician.bookings.length > 0 && (
                  <>
                    <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                      <div style={{ fontWeight: 600, marginBottom: 12 }}>Lịch sử đơn hàng</div>
                      <div style={{ overflowX: 'auto', maxWidth: '100%', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
                        <Table
                          columns={bookingColumns.filter(col => !['actions', 'customer', 'technician'].includes(col.key))}
                          dataSource={selectedTechnician.bookings}
                          rowKey="id"
                          pagination={{
                            pageSize: 5,
                            showSizeChanger: false,
                            showQuickJumper: false,
                            size: 'small'
                          }}
                          size="small"
                          scroll={{ x: 600 }}
                          style={{ minWidth: 600 }}
                          className="compact-table"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default FinancialManagement; 