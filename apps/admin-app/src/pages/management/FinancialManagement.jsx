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
import { serviceAPI } from '../../features/service/serviceAPI';
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
  const [serviceNameMap, setServiceNameMap] = useState({});

  const {
    totalRevenue = 0,
    totalHoldingAmount = 0,
    totalCommissionAmount = 0,
    totalTechnicianEarning = 0,
    totalWithdrawn = 0
  } = financialSummary || {};

  // Tạo technicianNameMap từ technicianAPI.getAll() giống như userMap
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const technicians = await technicianAPI.getAll();
        const technicianMapData = {};
        technicians.forEach(t => {
          if (t.id) {
            technicianMapData[t.id] = t.fullName || t.name || t.email || `KTV ${t.id}`;
          }
        });
        setTechnicianNameMap(technicianMapData);
        console.log('✅ TechnicianMap created successfully:', technicianMapData);
      } catch (error) {
        console.error('❌ Failed to fetch technicians:', error);
      }
    };
    
    fetchTechnicians();
  }, []);

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

  // Tạo serviceNameMap từ serviceAPI.getAll()
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const services = await serviceAPI.getAll();
        const serviceMapData = {};
        services.forEach(s => serviceMapData[s.id] = s.serviceName || s.name || s.id);
        setServiceNameMap(serviceMapData);
        console.log('✅ ServiceMap created successfully:', serviceMapData);
      } catch (error) {
        console.error('❌ Failed to fetch services:', error);
      }
    };
    
    fetchServices();
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
      serviceNameMap,
      sampleUser: Object.keys(userMap)[0],
      sampleTechnician: Object.keys(technicianNameMap)[0],
      sampleCustomer: Object.keys(customerNameMap)[0],
      sampleService: Object.keys(serviceNameMap)[0]
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
  }, [userMap, technicianNameMap, customerNameMap, serviceNameMap, bookingsFinancial, techniciansFinancialSummary]);

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

  // Cleanup filters when component unmounts
  useEffect(() => {
    return () => {
      // Reset filters when leaving the page
      setSearchText('');
      setStatusFilter('');
      setPaymentFilter('');
      setCurrentPage(1);
      setSortField('createdAt');
      setSortOrder('desc');
    };
  }, []);

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

  // Debug: Log technician mapping creation
  useEffect(() => {
    if (bookingsFinancial.length > 0) {
      console.log('🔍 Bookings data loaded, creating technician mapping...');
      console.log('🔍 First few bookings:', bookingsFinancial.slice(0, 3));
      
      // Tạo mapping trực tiếp để debug
      const debugTechMap = {};
      bookingsFinancial.forEach((booking, index) => {
        if (index < 5) { // Chỉ log 5 booking đầu tiên
          console.log(`🔍 Booking ${index + 1}:`, {
            id: booking.id,
            bookingCode: booking.bookingCode,
            technicianId: booking.technicianId,
            technicianName: booking.technicianName,
            technician: booking.technician,
            rawTechnicianData: booking
          });
        }
        
        if (booking.technicianId) {
          const technicianName = booking.technicianName || 
                                booking.technician?.fullName || 
                                booking.technician?.name ||
                                `Kỹ thuật viên ${booking.technicianId}`;
          debugTechMap[booking.technicianId] = technicianName;
        }
      });
      
      console.log('🔍 Debug technician mapping created:', debugTechMap);
    }
  }, [bookingsFinancial]);

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
      case 'DONE':
        return 'green';
      case 'PENDING':
      case 'Đang chờ':
        return 'orange';
      case 'CANCELLED':
      case 'Đã hủy':
        return 'red';
      case 'CONFIRMED':
      case 'Đã xác nhận':
        return 'blue';
      case 'IN_PROGRESS':
      case 'Đang xử lý':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const getPaymentColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'PAID':
      case 'Đã thanh toán':
        return 'green';
      case 'PENDING':
      case 'Chờ thanh toán':
        return 'orange';
      case 'FAILED':
      case 'Thanh toán thất bại':
        return 'red';
      case 'CANCELLED':
      case 'Đã hủy':
        return 'red';
      case 'REFUNDED':
      case 'Đã hoàn tiền':
        return 'blue';
      default:
        return 'default';
    }
  };

  // Helper function để format status và payment status
  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ') || status;
  };

  // Hàm để hiển thị status bằng tiếng Việt
  const getStatusDisplay = (status) => {
    const statusMapping = {
      'PENDING': 'Đang chờ',
      'CONFIRMED': 'Đã xác nhận',
      'IN_PROGRESS': 'Đang xử lý',
      'AWAITING_DONE': 'Chờ hoàn thành',
      'WAITING_CONFIRM': 'Chờ xác nhận',
      'CONFIRM_ADDITIONAL': 'Xác nhận bổ sung',
      'DONE': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'WAITING_CUSTOMER_CONFIRM_ADDITIONAL': 'Chờ khách xác nhận bổ sung',
      'WAITING_TECHNICIAN_CONFIRM_ADDITIONAL': 'Chờ thợ xác nhận bổ sung'
    };
    return statusMapping[status] || formatStatus(status);
  };

  // Hàm để hiển thị payment status bằng tiếng Việt
  const getPaymentStatusDisplay = (paymentStatus) => {
    const paymentStatusMapping = {
      'PENDING': 'Chờ thanh toán',
      'PAID': 'Đã thanh toán',
      'FAILED': 'Thanh toán thất bại',
      'CANCELLED': 'Đã hủy',
      'REFUNDED': 'Đã hoàn tiền'
    };
    return paymentStatusMapping[paymentStatus] || paymentStatus;
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
        data: filteredBookings.map(booking => {
          return {
            'Mã đơn hàng': booking.bookingCode,
            'Giá cuối cùng': formatCurrency(booking.finalPrice),
            'Số tiền giữ lại': formatCurrency(booking.holdingAmount),
            'Thu nhập kỹ thuật viên': formatCurrency(booking.technicianEarning),
            'Trạng thái': getStatusDisplay(booking.status),
            'Trạng thái thanh toán': getPaymentStatusDisplay(booking.paymentStatus),
            'Ngày tạo': formatDate(booking.createdAt)
          };
        }),
        columns: [
          { title: 'Mã đơn hàng', dataIndex: 'Mã đơn hàng' },
          { title: 'Giá cuối cùng', dataIndex: 'Giá cuối cùng' },
          { title: 'Số tiền giữ lại', dataIndex: 'Số tiền giữ lại' },
          { title: 'Thu nhập kỹ thuật viên', dataIndex: 'Thu nhập kỹ thuật viên' },
          { title: 'Trạng thái', dataIndex: 'Trạng thái' },
          { title: 'Trạng thái thanh toán', dataIndex: 'Trạng thái thanh toán' },
          { title: 'Ngày tạo', dataIndex: 'Ngày tạo' }
        ],
        fileName: 'financial_bookings_export',
        sheetName: 'Financial Bookings'
      };
    } else {
      window.currentPageExportData = {
        data: filteredTechnicians.map(technician => {
          return {
            'Tổng đơn hàng': technician.totalBookings,
            'Tổng thu nhập': formatCurrency(technician.totalEarning),
            'Số tiền giữ lại': formatCurrency(technician.totalHoldingAmount),
            'Đã rút': formatCurrency(technician.totalWithdrawn)
          };
        }),
        columns: [
          { title: 'Tổng đơn hàng', dataIndex: 'Tổng đơn hàng' },
          { title: 'Tổng thu nhập', dataIndex: 'Tổng thu nhập' },
          { title: 'Số tiền giữ lại', dataIndex: 'Số tiền giữ lại' },
          { title: 'Đã rút', dataIndex: 'Đã rút' }
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

  // Hàm để lấy CSS class cho status badge giống CouponManagement
  const getStatusBadgeClass = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'COMPLETED':
      case 'DONE':
        return 'bg-success-transparent';
      case 'PENDING':
        return 'bg-warning-transparent';
      case 'CANCELLED':
        return 'bg-danger-transparent';
      case 'CONFIRMED':
        return 'bg-info-transparent';
      case 'IN_PROGRESS':
        return 'bg-primary-transparent';
      case 'AWAITING_DONE':
      case 'WAITING_CONFIRM':
      case 'CONFIRM_ADDITIONAL':
        return 'bg-secondary-transparent';
      case 'WAITING_CUSTOMER_CONFIRM_ADDITIONAL':
      case 'WAITING_TECHNICIAN_CONFIRM_ADDITIONAL':
        return 'bg-warning-transparent';
      default:
        return 'bg-secondary-transparent';
    }
  };

  const getPaymentStatusBadgeClass = (paymentStatus) => {
    switch ((paymentStatus || '').toUpperCase()) {
      case 'PAID':
      case 'Đã thanh toán':
        return 'bg-success-transparent';
      case 'PENDING':
      case 'Chờ thanh toán':
        return 'bg-warning-transparent';
      case 'FAILED':
      case 'Thanh toán thất bại':
        return 'bg-danger-transparent';
      case 'CANCELLED':
      case 'Đã hủy':
        return 'bg-danger-transparent';
      case 'REFUNDED':
      case 'Đã hoàn tiền':
        return 'bg-info-transparent';
      default:
        return 'bg-secondary-transparent';
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
      width: 140,
      render: (text) => (
        <div style={{ maxWidth: 140, fontWeight: 500, fontSize: '12px' }}>
          {text?.length > 15 ? `${text.substring(0, 15)}...` : text}
        </div>
      ),
    },
    {
      title: 'Kỹ thuật viên',
      dataIndex: 'technicianId',
      key: 'technician',
      width: 150,
      render: (technicianId, record) => {
        const technicianName = technicianNameMap[technicianId] || (record.technicianName && record.technicianName !== 'Unknown' ? record.technicianName : 'Chưa có');
        return (
          <div style={{ maxWidth: 150, fontWeight: 500, fontSize: '12px' }}>
            {technicianName?.length > 20 ? `${technicianName.substring(0, 20)}...` : technicianName}
          </div>
        );
      }, 
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByFinalPrice}>
          Giá trị
          {sortField === 'finalPrice' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      width: 100,
      render: (price) => (
        <span style={{ fontWeight: 600, color: '#52c41a', fontSize: '12px' }}>
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByBookingHoldingAmount}>
          Giữ lại
          {sortField === 'holdingAmount' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'holdingAmount',
      key: 'holdingAmount',
      width: 90,
      render: (amount) => (
        <span style={{ fontWeight: 600, color: '#faad14', fontSize: '12px' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 90,
      render: (paymentStatus) => (
        <span className={`badge ${getPaymentStatusBadgeClass(paymentStatus)} text-dark`} style={{ fontSize: '11px' }}>
          {getPaymentStatusDisplay(paymentStatus)}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button className="management-action-btn" size="small" onClick={() => handleViewBookingDetails(record)}>
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
                    style={{ width: 250 }}
                    allowClear
                    value={statusFilter || undefined}
                    onChange={(value) => setStatusFilter(value)}
                  >
                    <Option value="PENDING">Đang chờ</Option>
                    <Option value="CONFIRMED">Đã xác nhận</Option>
                    <Option value="IN_PROGRESS">Đang xử lý</Option>
                    <Option value="AWAITING_DONE">Chờ hoàn thành</Option>
                    <Option value="WAITING_CONFIRM">Chờ xác nhận</Option>
                    <Option value="CONFIRM_ADDITIONAL">Xác nhận bổ sung</Option>
                    <Option value="DONE">Hoàn thành</Option>
                    <Option value="CANCELLED">Đã hủy</Option>
                    <Option value="WAITING_CUSTOMER_CONFIRM_ADDITIONAL">Chờ khách xác nhận bổ sung</Option>
                    <Option value="WAITING_TECHNICIAN_CONFIRM_ADDITIONAL">Chờ thợ xác nhận bổ sung</Option>
                  </Select>
                  <Select
                    placeholder="Thanh toán"
                    style={{ width: 180 }}
                    allowClear
                    value={paymentFilter || undefined}
                    onChange={(value) => setPaymentFilter(value)}
                  >
                    <Option value="PENDING">Chờ thanh toán</Option>
                    <Option value="PAID">Đã thanh toán</Option>
                    <Option value="FAILED">Thanh toán thất bại</Option>
                    <Option value="CANCELLED">Đã hủy</Option>
                    <Option value="REFUNDED">Đã hoàn tiền</Option>
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

          {/* Filter Info */}
          {(searchText || statusFilter || paymentFilter) && (
            <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
              <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
              {searchText && (
                <span className="badge bg-primary-transparent">
                  <i className="ti ti-search me-1"></i>
                  Tìm kiếm: "{searchText}"
                </span>
              )}
              {statusFilter && (
                <span className="badge bg-info-transparent">
                  <i className="ti ti-filter me-1"></i>
                  Trạng thái: {getStatusDisplay(statusFilter)}
                </span>
              )}
              {paymentFilter && (
                <span className="badge bg-warning-transparent">
                  <i className="ti ti-filter me-1"></i>
                  Thanh toán: {getPaymentStatusDisplay(paymentFilter)}
                </span>
              )}
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSearchText('');
                  setStatusFilter('');
                  setPaymentFilter('');
                }}
              >
                <i className="ti ti-x me-1"></i>
                Xóa tất cả
              </button>
            </div>
          )}

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
                    Hiển thị {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, sortedBookings.length)} trong tổng số {sortedBookings.length} đơn hàng
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
                    Hiển thị {indexOfFirstTechnician + 1}-{Math.min(indexOfLastTechnician, sortedTechnicians.length)} trong tổng số {sortedTechnicians.length} kỹ thuật viên
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
              <div style={{ background: 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)', padding: 24, color: 'black' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>Chi tiết đơn hàng</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Mã đơn hàng: {selectedBooking.bookingCode || selectedBooking.id}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Trạng thái thanh toán: </span>
                    <span className={`badge ${getPaymentStatusBadgeClass(selectedBooking.paymentStatus)} text-dark`} style={{ fontSize: 12, fontWeight: 600 }}>
                      {getPaymentStatusDisplay(selectedBooking.paymentStatus)}
                    </span>
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
                          { key: 'status', label: 'Trạng thái', children: getStatusDisplay(selectedBooking.status) || 'Chưa có' },
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
              <div style={{ background: 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)', padding: 24, color: 'black' }}>
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