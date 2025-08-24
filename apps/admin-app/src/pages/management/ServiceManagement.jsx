import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin, Select, Row, Col, Form, Input, Switch, InputNumber, Space } from 'antd';
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
  resetServiceState,
  fetchDeletedServices,
  restoreService,
} from '../../features/service/serviceSlice';
import { fetchCategories } from '../../features/categories/categorySlice';
import "../../styles/ManagementTableStyle.css";
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { createExportData, formatDateTime, formatCurrency } from '../../utils/exportUtils';
import IconUploader from '../../components/common/IconUploader';
import IconDisplay from '../../components/common/IconDisplay';

const initialFormState = {
  serviceName: '',
  categoryId: '',
  icon: '',
  isActive: true,
  description: '',
  fontFamily: 'Arial',
  fontSize: '14',
  textAlign: 'left',
};

const ServiceManagement = () => {
  const dispatch = useDispatch();
  const serviceState = useSelector((state) => state.service) || {};
  const categoryState = useSelector((state) => state.categories) || {};
  const { services = [], loading = false, error = null, success = false } = serviceState;
  const { categories = [] } = categoryState;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage, setServicesPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState();
  const [filterCategory, setFilterCategory] = useState();
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchDeletedServices());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      // Handle validation errors from backend
      if (error.errors) {
        const processed = processErrors(error.errors);
        setValidationErrors(processed);
      } else {
        message.error(error.title || 'Đã có lỗi xảy ra. Vui lòng thử lại!');
      }
      dispatch(resetServiceState());
    }
    if (success) {
      message.success('Thao tác thành công!');
      setShowAddModal(false);
      setShowEditModal(false);
      setShowDeleteModal(false);
      setFormData(initialFormState);
      setValidationErrors({});
      dispatch(resetServiceState());
      dispatch(fetchServices());
    }
  }, [error, success, dispatch]);

  const filteredServices = services.filter(svc =>
    svc.serviceName?.toLowerCase().includes(searchText.toLowerCase()) &&
    (!filterStatus || (filterStatus === 'ACTIVE' ? svc.isActive : !svc.isActive)) &&
    (!filterCategory || svc.categoryId === filterCategory)
  );

  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortField === 'serviceName') {
      if (!a.serviceName) return 1;
      if (!b.serviceName) return -1;
      if (sortOrder === 'asc') {
        return a.serviceName.localeCompare(b.serviceName);
      } else {
        return b.serviceName.localeCompare(a.serviceName);
      }
    } else if (sortField === 'createdAt' || sortField === 'lasted') {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = sortedServices.slice(indexOfFirstService, indexOfLastService);

  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredServices.length, searchText, filterStatus, filterCategory]);

  const handleSortChange = (value) => {
    if (value === 'lasted') {
      setSortField('createdAt');
      setSortOrder('desc');
    } else if (value === 'oldest') {
      setSortField('createdAt');
      setSortOrder('asc');
    }
  };

  const handleSortByName = () => {
    if (sortField === 'serviceName') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('serviceName');
      setSortOrder('asc');
    }
  };

  const handleSortByCategory = () => {
    if (sortField === 'category') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('category');
      setSortOrder('asc');
    }
  };

  const handleAddService = () => {
    setSelectedService(null); // Reset selected service for add mode
    setFormData(initialFormState);
    setValidationErrors({});
    setShowAddModal(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service); // CRITICAL FIX: This was missing!
    setFormData({
      serviceName: service.serviceName || '',
      categoryId: service.categoryId || '',
      icon: service.icon || '',
      isActive: service.isActive ?? true,
      description: service.description || '',
      fontFamily: service.fontFamily || 'Arial',
      fontSize: service.fontSize || '14',
      textAlign: service.textAlign || 'left',
      embedding: service.embedding || [],
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  const handleDeleteService = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedService) {
      // Use DELETE endpoint which now properly handles soft delete
      dispatch(deleteService(selectedService.id)).then((action) => {
        if (action.error && action.error.message) {
          message.error(action.error.message);
        } else {
          message.success('Xóa dịch vụ thành công');
          setShowDeleteModal(false);
          dispatch(resetServiceState());
          dispatch(fetchServices());
        }
      });
    }
  };

  const deletedServices = useSelector((state) => state.service.deletedServices) || [];

  const handleRestoreService = async (id) => {
    dispatch(restoreService(id)).then((action) => {
      if (action.error && action.error.message) {
        message.error(action.error.message);
      } else {
        message.success('Khôi phục dịch vụ thành công');
        setShowRestoreModal(false);
        dispatch(resetServiceState());
        dispatch(fetchServices());
        dispatch(fetchDeletedServices());
      }
    });
  };
  const handleOpenRestoreModal = () => {
    dispatch(fetchDeletedServices());
    setShowRestoreModal(true);
  };

  // Set export data và columns
  useEffect(() => {
    const exportColumns = [
      { title: 'Tên dịch vụ', dataIndex: 'serviceName' },
      { title: 'Danh mục', dataIndex: 'categoryName' },
      { title: 'Trạn thái', dataIndex: 'status' },
      { title: 'Mô tả', dataIndex: 'description' },
      { title: 'Thời gian tạo', dataIndex: 'createdAt' },
    ];

    const exportData = sortedServices.map(service => {
      const category = categories.find(cat => cat.id === service.categoryId);
      return {
        serviceName: service.serviceName,
        categoryName: category?.categoryName || service.categoryId,
        status: service.isActive ? 'ACTIVE' : 'INACTIVE',
        description: service.description,
        fontFamily: service.fontFamily || 'Arial',
        fontSize: service.fontSize || '14',
        textAlign: service.textAlign || 'left',
        embeddingDimensions: service.embedding?.length || 0,
        createdAt: formatDateTime(service.createdAt),
        updatedAt: formatDateTime(service.updatedAt),
      };
    });

    createExportData(exportData, exportColumns, 'services_export', 'Services');
  }, [sortedServices, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'serviceType') {
      setFormData(prev => ({
        ...prev,
        serviceType: value,
        estimatedMarketPrice: value === 'FIXED' ? { min: '', max: '' } : prev.estimatedMarketPrice
      }));
    } else if (name === 'min' || name === 'max') {
      setFormData(prev => ({
        ...prev,
        estimatedMarketPrice: {
          ...prev.estimatedMarketPrice,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFontChange = (property, value) => {
    setFormData(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target.result;
          // Thêm image tag với ảnh thật vào description
          const imageTag = `\n<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />\n`;
          setFormData(prev => ({
            ...prev,
            description: prev.description + imageTag
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const processErrors = (apiErrors) => {
    const newErrors = {};
    const generalErrors = [];
    Object.entries(apiErrors).forEach(([key, msgs]) => {
      const mappedKey = key === 'ServiceName' ? 'ServiceName' : 
                       key === 'CategoryId' ? 'CategoryId' :
                       key === 'Icon' ? 'Icon' : 
                       key === 'Description' ? 'Description' : key;
      const isTechError = msgs.some(msg =>
        msg.includes('could not be converted') || msg.includes('System.')
      );
      if (isTechError) {
        generalErrors.push('Nhập vào các trường * bắt buộc');
      } else if ([ 'ServiceName', 'CategoryId', 'Icon', 'Description' ].includes(mappedKey)) {
        newErrors[mappedKey] = msgs;
      } else {
        generalErrors.push(...msgs);
      }
    });
    if (generalErrors.length > 0) {
      newErrors.general = generalErrors.join(', ');
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Validation for service name length
    if (formData.serviceName && formData.serviceName.length > 100) {
      setValidationErrors({ ServiceName: ['Tên dịch vụ không được vượt quá 100 ký tự'] });
      message.error('Tên dịch vụ không được vượt quá 100 ký tự');
      return;
    }
    
    if (!formData.serviceName || !formData.categoryId || !formData.icon || !formData.description) {
      setValidationErrors({ general: 'Nhập vào các trường * bắt buộc' });
      return;
    }
    
    // Chuẩn bị data gửi lên BE - chuyển đổi từ camelCase sang PascalCase
    const dataToSend = {
      ServiceName: formData.serviceName,
      CategoryId: formData.categoryId,
      Icon: formData.icon || '',
      Description: formData.description || '',
      IsActive: formData.isActive,
      Embedding: formData.embedding || []
    };
    
    if (showAddModal) {
      dispatch(createService(dataToSend));
    } else if (showEditModal && selectedService) {
      dispatch(updateService({ id: selectedService.id, serviceData: dataToSend }));
    }
  };

  return (
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Quản lý dịch vụ</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
                <li className="breadcrumb-item active">Dịch vụ</li>
              </ol>
            </nav>
          </div>
          <div>
            <Button type="primary" onClick={handleAddService}>Thêm</Button>
            <Button type="default" onClick={handleOpenRestoreModal} style={{ marginLeft: 8 }}>Khôi phục</Button>
          </div>
        </div>
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
                  placeholder="Tìm tên dịch vụ"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>
            </div>            
            <Select
              placeholder="Danh mục"
              value={filterCategory || undefined}
              onChange={value => setFilterCategory(value)}
              style={{ width: 150 }}
              allowClear
            >
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>{cat.categoryName}</Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Trạng thái"
              value={filterStatus || undefined}
              onChange={value => setFilterStatus(value)}
              style={{ width: 130 }}
              allowClear
            >
              <Select.Option value="ACTIVE">ACTIVE</Select.Option>
              <Select.Option value="INACTIVE">INACTIVE</Select.Option>
            </Select>
          </div>
          <div className="d-flex align-items-center">
            <span style={{ marginRight: 8, fontWeight: 500 }}>Sắp xếp:</span>
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

        {/* Filter Info */}
        {(searchText || filterStatus || filterCategory) && (
          <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
            <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
            {searchText && (
              <span className="badge bg-primary-transparent">
                <i className="ti ti-search me-1"></i>
                Tìm kiếm: "{searchText}"
              </span>
            )}
            {filterCategory && (
              <span className="badge bg-info-transparent">
                <i className="ti ti-category me-1"></i>
                Danh mục: {categories.find(cat => cat.id === filterCategory)?.categoryName || filterCategory}
              </span>
            )}
            {filterStatus && (
              <span className="badge bg-warning-transparent">
                <i className="ti ti-filter me-1"></i>
                Trạng thái: {filterStatus}
              </span>
            )}
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setSearchText('');
                setFilterStatus(undefined);
                setFilterCategory(undefined);
              }}
            >
              <i className="ti ti-x me-1"></i>
              Xóa tất cả
            </button>
          </div>
        )}

        {loading ? <Spin /> : (
          <div className="custom-datatable-filter table-responsive">
            <table className="table datatable">
              <thead className="thead-light">
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={handleSortByName}>
                    Tên dịch vụ
                    {sortField === 'serviceName' && (
                      <span style={{ marginLeft: 4 }}>
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={handleSortByCategory}>
                    Danh mục
                    {sortField === 'category' && (
                      <span style={{ marginLeft: 4 }}>
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      <div>
                        <i className="ti ti-tools" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                        <p className="mb-0">Không có dịch vụ nào</p>
                      </div>
                    </td>
                  </tr>
                ) : currentServices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      <div>
                        <i className="ti ti-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                        <p className="mb-0">Không tìm thấy dịch vụ nào phù hợp</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentServices.map((svc) => {
                    const category = categories.find(cat => cat.id === svc.categoryId);
                    return (
                      <tr key={svc.id}>
                        <td>{svc.serviceName}</td>
                        <td>{category ? category.categoryName : '-'}</td>
                        <td>
                          <span className={`badge ${svc.isActive ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                            {svc.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td>
                          <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => handleEditService(svc)} style={{ marginRight: 8 }}>
                            Chỉnh sửa
                          </Button>
                          <Button className="management-action-btn" size="middle" danger onClick={() => handleDeleteService(svc)}>Xóa</Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex align-items-center gap-3">
            <div className="text-muted">
              Hiển thị {indexOfFirstService + 1}-{Math.min(indexOfLastService, filteredServices.length)} trong tổng số {filteredServices.length} dịch vụ
            </div>
          </div>
          {filteredServices.length > 0 && (
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
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Show all pages if total pages <= 7
                  if (totalPages <= 7) {
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
                  }
                  
                  // Show first page, last page, current page, and pages around current page
                  if (
                    pageNumber === 1 || 
                    pageNumber === totalPages || 
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
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
      </div>
      {/* Modal Thêm/Sửa */}
      <Modal
        title={showAddModal ? 'Thêm dịch vụ' : 'Cập nhật dịch vụ'}
        open={showAddModal || showEditModal}
        onCancel={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedService(null);
          setFormData(initialFormState);
          setValidationErrors({});
          dispatch(resetServiceState());
        }}
        footer={null}
        width={800}
        style={{ top: 20 }}
        destroyOnHidden
      >
        <Form layout="vertical" onSubmit={handleSubmit}>
          {validationErrors.general && (
            <div style={{ 
              color: 'red', 
              marginBottom: 16,
              padding: '8px 12px',
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {validationErrors.general.includes('The dto field is required') ||
               validationErrors.general.includes('could not be converted') ||
               validationErrors.general.includes('System.')
                ? 'Vui lòng nhập đầy đủ các trường bắt buộc (*)'
                : validationErrors.general}
            </div>
          )}
          
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item 
                label="Tên dịch vụ" 
                required 
                validateStatus={validationErrors.ServiceName ? 'error' : ''} 
                help={validationErrors.ServiceName ? validationErrors.ServiceName.join(', ') : ''}
              >
                <Input
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  placeholder="Nhập tên dịch vụ"
                  required
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Danh mục" 
                required 
                validateStatus={validationErrors.CategoryId ? 'error' : ''} 
                help={validationErrors.CategoryId ? validationErrors.CategoryId.join(', ') : ''}
              >
                <Select
                  placeholder="Chọn danh mục"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={(value) => handleChange({ target: { name: 'categoryId', value } })}
                  required
                  size="large"
                >
                  {categories.map(cat => (
                    <Select.Option key={cat.id} value={cat.id}>{cat.categoryName}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item 
                label="Chọn hình ảnh" 
                required 
                validateStatus={validationErrors.Icon ? 'error' : ''} 
                help={validationErrors.Icon ? validationErrors.Icon.join(', ') : ''}
              >
                <div style={{
                  padding: '12px',
                }}>
                  <IconUploader
                    value={formData.icon}
                    onChange={(value) => handleChange({ target: { name: 'icon', value } })}
                    placeholder="Đăng tải hình ảnh"
                  />
                </div>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái">
                <div style={{
                  padding: '12px',
                }}>
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(checked) => handleChange({ target: { name: 'isActive', type: 'checkbox', checked } })}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                  />
                  <div style={{
                    fontSize: 12,
                    color: '#8c8c8c',
                    marginTop: 8
                  }}>
                    {formData.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="Mô tả" 
            required 
            validateStatus={validationErrors.Description ? 'error' : ''} 
            help={validationErrors.Description ? validationErrors.Description.join(', ') : ''}
          >
            <div style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: '8px', 
              padding: '12px',
              background: '#ffffff'
            }}>
              <div style={{ 
                marginBottom: '12px', 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <Select
                  placeholder="Font Family"
                  style={{ width: 120 }}
                  onChange={(value) => handleFontChange('fontFamily', value)}
                  defaultValue="Arial"
                  value={formData.fontFamily}
                  size="small"
                >
                  <Select.Option value="Arial">Arial</Select.Option>
                  <Select.Option value="Times New Roman">Times New Roman</Select.Option>
                  <Select.Option value="Courier New">Courier New</Select.Option>
                  <Select.Option value="Georgia">Georgia</Select.Option>
                  <Select.Option value="Verdana">Verdana</Select.Option>
                </Select>
                <Select
                  placeholder="Font Size"
                  style={{ width: 80 }}
                  onChange={(value) => handleFontChange('fontSize', value)}
                  defaultValue="14"
                  value={formData.fontSize}
                  size="small"
                >
                  <Select.Option value="12">12px</Select.Option>
                  <Select.Option value="14">14px</Select.Option>
                  <Select.Option value="16">16px</Select.Option>
                  <Select.Option value="18">18px</Select.Option>
                  <Select.Option value="20">20px</Select.Option>
                </Select>
                <Space.Compact size="small">
                  <Button 
                    type={formData.textAlign === 'left' ? 'primary' : 'default'}
                    onClick={() => handleFontChange('textAlign', 'left')}
                  >
                    <i className="ti ti-align-left"></i>
                  </Button>
                  <Button 
                    type={formData.textAlign === 'center' ? 'primary' : 'default'}
                    onClick={() => handleFontChange('textAlign', 'center')}
                  >
                    <i className="ti ti-align-center"></i>
                  </Button>
                  <Button 
                    type={formData.textAlign === 'right' ? 'primary' : 'default'}
                    onClick={() => handleFontChange('textAlign', 'right')}
                  >
                    <i className="ti ti-align-right"></i>
                  </Button>
                </Space.Compact>
                <Button 
                  size="small"
                  onClick={() => handleImageUpload()}
                  icon={<i className="ti ti-photo"></i>}
                >
                  Thêm ảnh
                </Button>
              </div>
              <Input.TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Nhập mô tả dịch vụ..."
                required
                style={{
                  fontFamily: formData.fontFamily || 'Arial',
                  fontSize: `${formData.fontSize || 14}px`,
                  textAlign: formData.textAlign || 'left',
                  border: 'none',
                  resize: 'none'
                }}
              />
            </div>
          </Form.Item>

          <div className="d-flex justify-content-end" style={{ 
            paddingTop: '16px',
            borderTop: '1px solid #f0f0f0',
            marginTop: '16px'
          }}>
            <Button 
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedService(null);
                setFormData(initialFormState);
                setValidationErrors({});
                dispatch(resetServiceState());
              }} 
              style={{ marginRight: 12 }}
              size="large"
            >
              Hủy 
            </Button>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              size="large"
            >
              {showAddModal ? 'Thêm' : 'Lưu'}
            </Button>
          </div>
        </Form>
      </Modal>
      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onCancel={() => {
          setShowDeleteModal(false);
          dispatch(resetServiceState());
        }}
        footer={null}
        title="Xóa dịch vụ"
      >
        <div className="modal-body text-center">
          <i className="ti ti-trash-x fs-26 text-danger mb-3 d-inline-block"></i>
          <h4 className="mb-1">Xóa dịch vụ</h4>
          <p className="mb-3">Bạn có chắc muốn xóa dịch vụ này?</p>
          <div className="d-flex justify-content-center">
            <button type="button" className="btn btn-light me-3" onClick={() => {
              setShowDeleteModal(false);
              dispatch(resetServiceState());
            }}>Hủy</button>
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Xóa</button>
          </div>
        </div>
      </Modal>
      {/* Restore Modal */}
      <Modal
        open={showRestoreModal}
        onCancel={() => {
          setShowRestoreModal(false);
          dispatch(resetServiceState());
        }}
        footer={null}
        title="Khôi phục dịch vụ"
        width={800}
      >
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>Tên dịch vụ</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {deletedServices.map((svc) => (
                <tr key={svc.id}>
                  <td>{svc.serviceName}</td>
                  <td>{categories.find(cat => cat.id === svc.categoryId)?.categoryName || '-'}</td>
                  <td>
                    <span className={`badge ${svc.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {svc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Button size="small" type="primary" onClick={() => handleRestoreService(svc.id)}>
                      Khôi phục
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="button" className="btn btn-light" onClick={() => {
            setShowRestoreModal(false);
            dispatch(resetServiceState());
          }}>Đóng</button>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceManagement; 