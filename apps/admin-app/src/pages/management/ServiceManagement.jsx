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
import { createExportData, formatDateTime, formatCurrency } from '../../utils/exportUtils';
import IconUploader from '../../components/common/IconUploader';
import IconDisplay from '../../components/common/IconDisplay';

const initialFormState = {
  serviceName: '',
  categoryId: '',
  icon: '',
  isActive: true,
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
      description: service.description || '',
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
        embeddingDimensions: service.embedding?.length || 0,
        createdAt: formatDateTime(service.createdAt),
        updatedAt: formatDateTime(service.updatedAt),
      };
    });

    createExportData(exportData, exportColumns, 'services_export', 'Services');
  }, [sortedServices, categories]);

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

  const handleSubmit = async (e) => {
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
    try {
      if (showAddModal) {
        await dispatch(createService(dataToSend));
      } else if (showEditModal && selectedService) {
        await dispatch(updateService({ id: selectedService.id, serviceData: dataToSend }));
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      message.error('Có lỗi xảy ra');
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
                   <th>Hàng động</th>
                </tr>
              </thead>
              <tbody>
                {currentServices.map((svc) => {
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
        title={showAddModal ? 'Thêm dịch vụ' : 'Cập nhật dịch vụ'}
        open={showAddModal || showEditModal}
        onCancel={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        footer={null}
        width={800}
        style={{ top: 20 }}
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
               <Form.Item label="Tên dịch vụ" required validateStatus={validationErrors.ServiceName ? 'error' : ''} help={validationErrors.ServiceName ? validationErrors.ServiceName.join(', ') : ''}>
                 <Input
                   name="serviceName"
                   value={formData.serviceName}
                   onChange={handleChange}
                   placeholder="Nhập tên dịch vụ"
                   required
                 />
               </Form.Item>
             </Col>
             <Col span={12}>
               <Form.Item label="Danh mục" required validateStatus={validationErrors.CategoryId ? 'error' : ''} help={validationErrors.CategoryId ? validationErrors.CategoryId.join(', ') : ''}>
                 <Select
                   placeholder="Chọn danh mục"
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
               <Form.Item label="Chọn hình ảnh" required validateStatus={validationErrors.Icon ? 'error' : ''} help={validationErrors.Icon ? validationErrors.Icon.join(', ') : ''}>
                 <IconUploader
                   value={formData.icon}
                   onChange={(value) => handleChange({ target: { name: 'icon', value } })}
                   placeholder="Đăng tải hình ảnh"
                 />
               </Form.Item>
             </Col>
             <Col span={12}>
               <Form.Item label="Trạng thái">
                 <Switch
                   name="isActive"
                   checked={formData.isActive}
                   onChange={(checked) => handleChange({ target: { name: 'isActive', type: 'checkbox', checked } })}
                   checkedChildren="Active"
                   unCheckedChildren="Inactive"
                 />
               </Form.Item>
             </Col>
           </Row>

            <Form.Item label="Mô tả" required validateStatus={validationErrors.Description ? 'error' : ''} help={validationErrors.Description ? validationErrors.Description.join(', ') : ''}>
             <Input.TextArea
               name="description"
               value={formData.description}
               onChange={handleChange}
               rows={3}
               placeholder="Nhập mô tả dịch vụ"
             />
           </Form.Item>

          <div className="d-flex justify-content-end">
            <Button onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }} style={{ marginRight: 8 }}>
              Hủy 
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {showAddModal ? 'Thêm' : 'Lưu'}
            </Button>
          </div>
        </Form>
      </Modal>
      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        footer={null}
        title="Xóa dịch vụ"
      >
        <div className="modal-body text-center">
          <i className="ti ti-trash-x fs-26 text-danger mb-3 d-inline-block"></i>
          <h4 className="mb-1">Xóa dịch vụ</h4>
          <p className="mb-3">Bạn có chắc muốn xóa dịch vụ này?</p>
          <div className="d-flex justify-content-center">
            <button type="button" className="btn btn-light me-3" onClick={() => setShowDeleteModal(false)}>Hủy</button>
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Xóa</button>
          </div>
        </div>
      </Modal>
      {/* Restore Modal */}
      <Modal
        open={showRestoreModal}
        onCancel={() => setShowRestoreModal(false)}
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
          <button type="button" className="btn btn-light" onClick={() => setShowRestoreModal(false)}>Đóng</button>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceManagement; 