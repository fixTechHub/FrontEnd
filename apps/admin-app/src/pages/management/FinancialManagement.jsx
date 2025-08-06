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
  Divider,
  Popconfirm
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
// Không cần import userAPI, technicianAPI, serviceAPI nữa vì backend đã cung cấp names
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

  // Redux selectors
  const financialSummary = useSelector(state => state.financialReport.financialSummary);
  const bookingsFinancial = useSelector(state => state.financialReport.bookingsFinancial);
  const techniciansFinancialSummary = useSelector(state => state.financialReport.techniciansFinancialSummary);
  const loading = useSelector(state => state.financialReport.loading);
  const error = useSelector(state => state.financialReport.error);

  const {
    totalRevenue = 0,
    totalHoldingAmount = 0,
    totalCommissionAmount = 0,
    totalTechnicianEarning = 0,
    totalWithdrawn = 0
  } = financialSummary || {};

  // Load financial data on component mount
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        dispatch(fetchFinancialSummary());
        dispatch(fetchAllBookingsFinancial());
        dispatch(fetchAllTechniciansFinancialSummary());
      } catch (error) {
        message.error('Failed to load financial data');
      }
    };

    fetchFinancialData();
  }, [dispatch]);

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
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Reset filters khi chuyển tab
  useEffect(() => {
    setSearchText('');
    setStatusFilter('');
    setPaymentFilter('');
  }, [activeTab]);

  const handleFilterChange = (filterType, value) => {
    // TODO: Implement filter logic
    console.log('Filter changed:', filterType, value);
  };

  const handleClearFilters = () => {
    // TODO: Implement clear filter logic
    console.log('Clear filters');
  };

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsBookingModalVisible(true);
  };

  const handleViewTechnicianDetails = (technicianId) => {
    try {
      console.log('Viewing technician details for ID:', technicianId);
      
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
      
      console.log('Technician details from existing data:', technicianDetails);
      console.log('Technician bookings from existing data:', technicianBookings);
      
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

  // Filter và search data
  const filteredBookings = bookingsFinancial.filter(booking => {
    const matchesSearch = !searchText || 
      booking.bookingCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.technicianName?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    const matchesPayment = !paymentFilter || booking.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const filteredTechnicians = techniciansFinancialSummary.filter(technician => {
    const matchesSearch = !searchText || 
      technician.technicianId?.toLowerCase().includes(searchText.toLowerCase()) ||
      technician.technicianName?.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesSearch;
  });

  const bookingColumns = [
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByBookingCode}>
          CODE
          {sortField === 'bookingCode' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      width: 120,
      render: (text) => (
        <div style={{ maxWidth: 120, fontWeight: 500, fontSize: '12px' }}>
          {text?.length > 15 ? `${text.substring(0, 15)}...` : text}
        </div>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByFinalPrice}>
          FINAL PRICE
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
          HOLDING
          {sortField === 'holdingAmount' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'holdingAmount',
      key: 'holdingAmount',
      width: 100,
      render: (amount) => (
        <span style={{ fontWeight: 600, color: '#faad14', fontSize: '12px' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByCommissionAmount}>
          COMMISSION
          {sortField === 'commissionAmount' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'commissionAmount',
      key: 'commissionAmount',
      width: 100,
      render: (amount) => (
        <span style={{ fontWeight: 600, color: '#1890ff', fontSize: '12px' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByTechnicianEarning}>
          TECHNICIAN EARNING
          {sortField === 'technicianEarning' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'technicianEarning',
      key: 'technicianEarning',
      width: 120,
      render: (earning) => (
        <span style={{ fontWeight: 600, color: '#722ed1', fontSize: '12px' }}>
          {formatCurrency(earning)}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{fontSize: '11px'}}>
          {formatStatus(status)?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'PAYMENT',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (paymentStatus) => (
        <Tag color={getPaymentColor(paymentStatus)} style={{fontSize: '11px'}}>
          {formatStatus(paymentStatus)?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button className="management-action-btn" size="middle" onClick={() => handleViewBookingDetails(record)}>
            <EyeOutlined style={{marginRight: 4}} />View Detail
          </Button>
        </Space>
      ),
    },
  ];

  const technicianColumns = [
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByTechnicianName}>
          TECHNICIAN NAME
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
          TOTAL EARNING
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
        <div style={{ cursor: 'pointer' }} onClick={handleSortByCommissionPaid}>
          COMMISSION PAID
          {sortField === 'totalCommissionPaid' && (
            <span style={{ marginLeft: 4 }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      ),
      dataIndex: 'totalCommissionPaid',
      key: 'totalCommissionPaid',
      render: (commission) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>
          {formatCurrency(commission)}
        </span>
      ),
    },
    {
      title: (
        <div style={{ cursor: 'pointer' }} onClick={handleSortByHoldingAmount}>
          HOLDING AMOUNT
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
          WITHDRAWN
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
          TOTAL BOOKINGS
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
      title: 'ACTIONS',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button className="management-action-btn" size="middle" onClick={() => handleViewTechnicianDetails(record.technicianId)}>
            <EyeOutlined style={{marginRight: 4}} />View Detail
          </Button>
        </Space>
      ),
    },
  ];

  // Sort data theo sortField/sortOrder
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'bookingCode') {
      const codeA = a.bookingCode || '';
      const codeB = b.bookingCode || '';
      return sortOrder === 'asc' ? codeA.localeCompare(codeB) : codeB.localeCompare(codeA);
    } else if (sortField === 'finalPrice') {
      return sortOrder === 'asc' ? a.finalPrice - b.finalPrice : b.finalPrice - a.finalPrice;
    } else if (sortField === 'holdingAmount') {
      return sortOrder === 'asc' ? a.holdingAmount - b.holdingAmount : b.holdingAmount - a.holdingAmount;
    } else if (sortField === 'commissionAmount') {
      return sortOrder === 'asc' ? a.commissionAmount - b.commissionAmount : b.commissionAmount - a.commissionAmount;
    } else if (sortField === 'technicianEarning') {
      return sortOrder === 'asc' ? a.technicianEarning - b.technicianEarning : b.technicianEarning - a.technicianEarning;
    }
    return 0;
  });

  const sortedTechnicians = [...filteredTechnicians].sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'technicianName') {
      const nameA = a.technicianName || '';
      const nameB = b.technicianName || '';
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortField === 'totalEarning') {
      return sortOrder === 'asc' ? a.totalEarning - b.totalEarning : b.totalEarning - a.totalEarning;
    } else if (sortField === 'totalCommissionPaid') {
      return sortOrder === 'asc' ? a.totalCommissionPaid - b.totalCommissionPaid : b.totalCommissionPaid - a.totalCommissionPaid;
    } else if (sortField === 'totalHoldingAmount') {
      return sortOrder === 'asc' ? a.totalHoldingAmount - b.totalHoldingAmount : b.totalHoldingAmount - a.totalHoldingAmount;
    } else if (sortField === 'totalWithdrawn') {
      return sortOrder === 'asc' ? a.totalWithdrawn - b.totalWithdrawn : b.totalWithdrawn - a.totalWithdrawn;
    } else if (sortField === 'totalBookings') {
      return sortOrder === 'asc' ? a.totalBookings - b.totalBookings : b.totalBookings - a.totalBookings;
    }
    return 0;
  });

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
                  }}>Total Revenue</h5>
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
                  }}>Holding Amount</h5>
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
                  }}>Technician Earning</h5>
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
                  }}>Withdrawn</h5>
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
                    placeholder={activeTab === 'bookings' ? "Search booking code, customer, technician" : "Search technician ID, name"}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
              {activeTab === 'bookings' && (
                <>
                  <Select
                    placeholder="Status"
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
                    placeholder="Payment"
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
              <span className="sort-label" style={{ marginRight: 8, fontWeight: 500, color: '#222', fontSize: 15 }}>Sort by:</span>
              <Select
                value={sortField === 'createdAt' && sortOrder === 'desc' ? 'lasted' : 'oldest'}
                style={{ width: 120 }}
                onChange={handleSortChange}
                options={[
                  { value: 'lasted', label: 'Lasted' },
                  { value: 'oldest', label: 'Oldest' },
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
                Bookings
              </button>
              <button
                type="button"
                className={`btn ${activeTab === 'technicians' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('technicians')}
              >
                Technicians
              </button>
            </div>
          </div>

          {/* Content Tables */}
          {activeTab === 'bookings' && (
            <Table
              columns={bookingColumns}
              dataSource={sortedBookings}
              rowKey="id"
              loading={loading}
              pagination={{
                total: sortedBookings.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} bookings`,
              }}
            />
          )}

          {activeTab === 'technicians' && (
            <Table
              columns={technicianColumns}
              dataSource={sortedTechnicians}
              rowKey="technicianId"
              loading={loading}
              pagination={{
                total: sortedTechnicians.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} technicians`,
              }}
            />
          )}
        </Card>

        {/* Booking Details Modal */}
        {isBookingModalVisible && selectedBooking && (
          <Modal
            open={isBookingModalVisible}
            onCancel={() => setIsBookingModalVisible(false)}
            footer={null}
            title={null}
            width={600}
          >
            <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24}}>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 22, fontWeight: 600, marginBottom: 4}}>
                    <span style={{marginRight: 12}}>{selectedBooking.bookingCode}</span>
                    <Tag color={getStatusColor(selectedBooking.status)} style={{fontSize: 14, padding: '2px 12px', marginRight: 8}}>
                      {formatStatus(selectedBooking.status)?.toUpperCase()}
                    </Tag>
                    <Tag color={getPaymentColor(selectedBooking.paymentStatus)} style={{fontSize: 14, padding: '2px 12px'}}>
                      {formatStatus(selectedBooking.paymentStatus)?.toUpperCase()}
                    </Tag>
                  </div>
                </div>
              </div>
              <div style={{borderTop: '1px solid #f0f0f0', marginBottom: 16}}></div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Customer</div>
                  <div>{selectedBooking.customerName || selectedBooking.customerId || ""}</div>
                </div>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Technician</div>
                  <div>{selectedBooking.technicianName || selectedBooking.technicianId || ""}</div>
                </div>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Final Price</div>
                  <div style={{color: '#52c41a', fontWeight: 600}}>{formatCurrency(selectedBooking.finalPrice)}</div>
                </div>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Holding Amount</div>
                  <div style={{color: '#faad14', fontWeight: 600}}>{formatCurrency(selectedBooking.holdingAmount)}</div>
                </div>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Commission</div>
                  <div style={{color: '#1890ff', fontWeight: 600}}>{formatCurrency(selectedBooking.commissionAmount)}</div>
                </div>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Technician Earning</div>
                  <div style={{color: '#722ed1', fontWeight: 600}}>{formatCurrency(selectedBooking.technicianEarning)}</div>
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
            width={900}
            style={{top: 20}}
          >
            <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 24}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24}}>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 22, fontWeight: 600, marginBottom: 4}}>
                    <span style={{marginRight: 12}}>{selectedTechnician.technicianName}</span>
                  </div>
                </div>
              </div>
              <div style={{borderTop: '1px solid #f0f0f0', marginBottom: 16}}></div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Technician ID</div>
                  <div>{selectedTechnician.technicianId}</div>
                </div>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Total Bookings</div>
                  <div style={{color: '#1890ff', fontWeight: 600}}>{selectedTechnician.totalBookings}</div>
                </div>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Total Earning</div>
                  <div style={{color: '#52c41a', fontWeight: 600}}>{formatCurrency(selectedTechnician.totalEarning)}</div>
                </div>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Commission Paid</div>
                  <div style={{color: '#1890ff', fontWeight: 600}}>{formatCurrency(selectedTechnician.totalCommissionPaid)}</div>
                </div>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Holding Amount</div>
                  <div style={{color: '#faad14', fontWeight: 600}}>{formatCurrency(selectedTechnician.totalHoldingAmount)}</div>
                </div>
                <div>
                  <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Withdrawn</div>
                  <div style={{color: '#722ed1', fontWeight: 600}}>{formatCurrency(selectedTechnician.totalWithdrawn)}</div>
                </div>
              </div>
              
              {selectedTechnician.bookings && selectedTechnician.bookings.length > 0 && (
                <>
                  <Divider />
                  <div style={{marginBottom: 16}}>
                    <div style={{fontWeight: 500, color: '#222', marginBottom: 12, fontSize: '14px'}}>Booking History</div>
                    <div style={{overflowX: 'auto', maxWidth: '100%', border: '1px solid #f0f0f0', borderRadius: '6px'}}>
                      <Table
                        columns={bookingColumns.filter(col => !['actions', 'customer', 'technician'].includes(col.key))}
                        dataSource={selectedTechnician.bookings}
                        rowKey="id"
                        pagination={{
                          pageSize: 5,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          size: 'small'
                        }}
                        size="small"
                        scroll={{ x: 600 }}
                        style={{minWidth: 600}}
                        className="compact-table"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default FinancialManagement; 