import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin, Select, Row, Col, Form, Input, Switch, InputNumber } from 'antd';
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
import "../../../public/css/ManagementTableStyle.css";
import { EyeOutlined, EditOutlined } from '@ant-design/icons';

const initialFormState = {
  serviceName: '',
  categoryId: '',
  icon: '',
  isActive: true,
  serviceType: 'FIXED',
  estimatedMarketPrice: { min: '', max: '' },
  description: '',
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
  const servicesPerPage = 10;
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
      message.error(error.title || 'Đã có lỗi xảy ra. Vui lòng thử lại!');
      dispatch(resetServiceState());
    }
    if (success) {
      message.success('Thao tác thành công!');
      setShowAddModal(false);
      setShowEditModal(false);
      setShowDeleteModal(false);
      dispatch(resetServiceState());
      dispatch(fetchServices());
    }
  }, [error, success, dispatch]);

  const filteredServices = services.filter(svc =>
    svc.serviceName?.toLowerCase().includes(searchText.toLowerCase()) &&
    (!filterStatus || (filterStatus === 'ACTIVE' ? svc.isActive : !svc.isActive)) &&
    (!filterCategory || svc.categoryId === filterCategory)
  );

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
    setFormData(initialFormState);
    setValidationErrors({});
    setShowAddModal(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setFormData({
      serviceName: service.serviceName || '',
      categoryId: service.categoryId || '',
      icon: service.icon || '',
      isActive: service.isActive ?? true,
      serviceType: service.serviceType || 'FIXED',
      estimatedMarketPrice: service.estimatedMarketPrice || { min: '', max: '' },
      description: service.description || '',
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
      dispatch(deleteService(selectedService.id));
    }
  };

  const deletedServices = useSelector((state) => state.service.deletedServices) || [];

  const handleRestoreService = async (id) => {
    await dispatch(restoreService(id));
    setShowRestoreModal(false);
  };
  const handleOpenRestoreModal = () => {
    dispatch(fetchDeletedServices());
    setShowRestoreModal(true);
  };

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortField === 'serviceName') {
      if (!a.serviceName) return 1;
      if (!b.serviceName) return -1;
      if (sortOrder === 'asc') {
        return a.serviceName.localeCompare(b.serviceName);
      } else {
        return b.serviceName.localeCompare(a.serviceName);
      }
    } else if (sortField === 'category') {
      const catA = categories.find(cat => cat.id === a.categoryId)?.categoryName?.toLowerCase() || 'zzz';
      const catB = categories.find(cat => cat.id === b.categoryId)?.categoryName?.toLowerCase() || 'zzz';
      if (sortOrder === 'asc') {
        return catA.localeCompare(catB);
      } else {
        return catB.localeCompare(catA);
      }
    } else if (sortField === 'createdAt') {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      if (sortOrder === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    }
    return 0;
  });
  const currentServices = sortedServices.slice(indexOfFirstService, indexOfLastService);

  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
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

  const processErrors = (apiErrors) => {
    const newErrors = {};
    const generalErrors = [];
    Object.entries(apiErrors).forEach(([key, msgs]) => {
      const mappedKey = key === 'ServiceName' ? 'ServiceName' : key === 'Icon' ? 'Icon' : key;
      const isTechError = msgs.some(msg =>
        msg.includes('could not be converted') || msg.includes('System.')
      );
      if (isTechError) {
        generalErrors.push('Nhập vào các trường * bắt buộc');
      } else if ([ 'ServiceName', 'Icon' ].includes(mappedKey)) {
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
    if (!formData.serviceName || !formData.categoryId) {
      setValidationErrors({ general: 'Nhập vào các trường * bắt buộc' });
      return;
    }
    // Chuẩn bị data gửi lên BE
    const dataToSend = { ...formData };
    if (formData.serviceType === 'COMPLEX') {
      dataToSend.estimatedMarketPrice = {
        min: Number(formData.estimatedMarketPrice.min),
        max: Number(formData.estimatedMarketPrice.max)
      };
    } else {
      delete dataToSend.estimatedMarketPrice;
    }
    if (showAddModal) {
      dispatch(createService(dataToSend)).then((action) => {
        if (action.payload && action.payload.errors) {
          const apiErrors = action.payload.errors;
          const processed = processErrors(apiErrors);
          setValidationErrors(processed);
        }
      });
    } else if (showEditModal && selectedService) {
      dispatch(updateService({ id: selectedService.id, serviceData: dataToSend })).then((action) => {
        if (action.payload && action.payload.errors) {
          const apiErrors = action.payload.errors;
          const processed = processErrors(apiErrors);
          setValidationErrors(processed);
        }
      });
    }
  };

  return (
    <div className="modern-page-wrapper">
      <div className="modern-content-card">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Service Management</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item active">Services</li>
              </ol>
            </nav>
          </div>
          <div>
            <Button type="primary" onClick={handleAddService}>Add Service</Button>
            <Button type="default" onClick={handleOpenRestoreModal} style={{ marginLeft: 8 }}>Restore</Button>
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
                  placeholder="Search name"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>
            </div>            
            <Select
              placeholder="Category"
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
              placeholder="Status"
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
            <span style={{ marginRight: 8, fontWeight: 500 }}>Sort by:</span>
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
        {loading ? <Spin /> : (
          <div className="custom-datatable-filter table-responsive">
            <table className="table datatable">
              <thead className="thead-light">
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={handleSortByName}>
                    SERVICE NAME
                    {sortField === 'serviceName' && (
                      <span style={{ marginLeft: 4 }}>
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={handleSortByCategory}>
                    CATEGORY
                    {sortField === 'category' && (
                      <span style={{ marginLeft: 4 }}>
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th>SERVICE TYPE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {currentServices.map((svc) => {
                  const category = categories.find(cat => cat.id === svc.categoryId);
                  return (
                    <tr key={svc.id}>
                      <td>{svc.serviceName}</td>
                      <td>{category ? category.categoryName : '-'}</td>
                      <td>{svc.serviceType}</td>
                      <td>
                        <span className={`badge ${svc.isActive ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                          {svc.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>
                        <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => handleEditService(svc)} style={{ marginRight: 8 }}>
                          Edit
                        </Button>
                        <Button className="management-action-btn" size="middle" danger onClick={() => handleDeleteService(svc)}>Delete</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="d-flex justify-content-end mt-3">
          <nav>
            <ul className="pagination mb-0">
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      {/* Modal Thêm/Sửa */}
      <Modal
        title={showAddModal ? 'Add Service' : 'Update Service'}
        open={showAddModal || showEditModal}
        onCancel={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <Form layout="vertical" onSubmit={handleSubmit}>
          {validationErrors.general && (
            <div style={{ color: 'red', marginBottom: 8 }}>
              {validationErrors.general.includes('The dto field is required') ||
               validationErrors.general.includes('could not be converted') ||
               validationErrors.general.includes('System.')
                ? 'Nhập vào các trường * bắt buộc'
                : validationErrors.general}
            </div>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Service Name" required validateStatus={validationErrors.ServiceName ? 'error' : ''} help={validationErrors.ServiceName ? validationErrors.ServiceName.join(', ') : ''}>
                <Input
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  placeholder="Enter service name"
                  required
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Category" required validateStatus={validationErrors.CategoryId ? 'error' : ''} help={validationErrors.CategoryId ? validationErrors.CategoryId.join(', ') : ''}>
                <Select
                  placeholder="Choose category"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={(value) => handleChange({ target: { name: 'categoryId', value } })}
                  required
                >
                  {categories.map(cat => (
                    <Select.Option key={cat.id} value={cat.id}>{cat.categoryName}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Icon" validateStatus={validationErrors.Icon ? 'error' : ''} help={validationErrors.Icon ? validationErrors.Icon.join(', ') : ''}>
                <Input
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  placeholder="Enter icon (e.g., ti ti-tools)"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Service Type">
                <Select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={(value) => handleChange({ target: { name: 'serviceType', value } })}
                >
                  <Select.Option value="FIXED">FIXED</Select.Option>
                  <Select.Option value="COMPLEX">COMPLEX</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {formData.serviceType === 'COMPLEX' && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Min Market Price (VND)" required>
                  <InputNumber
                    name="min"
                    value={formData.estimatedMarketPrice.min}
                    onChange={(value) => handleChange({ target: { name: 'min', value: value?.toString() || '' } })}
                    min={1}
                    style={{ width: '100%' }}
                    placeholder="Enter min price"
                    required={formData.serviceType === 'COMPLEX'}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Max Market Price (VND)" required>
                  <InputNumber
                    name="max"
                    value={formData.estimatedMarketPrice.max}
                    onChange={(value) => handleChange({ target: { name: 'max', value: value?.toString() || '' } })}
                    min={1}
                    style={{ width: '100%' }}
                    placeholder="Enter max price"
                    required={formData.serviceType === 'COMPLEX'}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item label="Description">
            <Input.TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter service description"
            />
          </Form.Item>

          <Form.Item label="Status">
            <Switch
              name="isActive"
              checked={formData.isActive}
              onChange={(checked) => handleChange({ target: { name: 'isActive', type: 'checkbox', checked } })}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </Form.Item>

          <div className="d-flex justify-content-end">
            <Button onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {showAddModal ? 'Add' : 'Save'}
            </Button>
          </div>
        </Form>
      </Modal>
      {/* Modal Xóa */}
      <Modal
        title="Delete service"
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onOk={confirmDelete}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        destroyOnHidden
      >
        <p>Bạn có chắc chắn muốn xóa dịch vụ này?</p>
      </Modal>
      {/* Restore Modal */}
      <Modal
        open={showRestoreModal}
        onCancel={() => setShowRestoreModal(false)}
        footer={null}
        title="Restore Service"
        width={800}
      >
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>NAME</th>
                <th>CATEGORY</th>
                <th>SERVICE TYPE</th>
                <th>ICON</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {deletedServices.map((svc) => (
                <tr key={svc.id}>
                  <td>{svc.serviceName}</td>
                  <td>{categories.find(cat => cat.id === svc.categoryId)?.categoryName || '-'}</td>
                  <td>{svc.serviceType}</td>
                  <td>{svc.icon}</td>
                  <td>
                    <span className={`badge ${svc.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {svc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Button size="small" type="primary" onClick={() => handleRestoreService(svc.id)}>
                      Restore
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="button" className="btn btn-light" onClick={() => setShowRestoreModal(false)}>Close</button>
        </div>
      </Modal>
      {/* Detail Modal */}
      <Modal
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        title="Service Detail"
        width={600}
        destroyOnHidden
      >
        {selectedService && (
          <div className="p-3">
            <p><strong>Service Name:</strong> {selectedService.serviceName}</p>
            <p><strong>Category:</strong> {categories.find(cat => cat.id === selectedService.categoryId)?.categoryName || '-'}</p>
            <p><strong>Icon:</strong> {selectedService.icon || 'N/A'}</p>
            <p><strong>Status:</strong> {selectedService.isActive ? 'Active' : 'Inactive'}</p>
            <p><strong>Service Type:</strong> {selectedService.serviceType}</p>
            <p><strong>Estimated Market Price:</strong> {selectedService.estimatedMarketPrice ? `${selectedService.estimatedMarketPrice.min} - ${selectedService.estimatedMarketPrice.max}` : 'N/A'}</p>
            <p><strong>Description:</strong> {selectedService.description || 'N/A'}</p>
            <p><strong>Created At:</strong> {new Date(selectedService.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated At:</strong> {new Date(selectedService.updatedAt).toLocaleDateString()}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServiceManagement; 