import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin } from 'antd';
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
  resetServiceState,
} from '../../features/service/serviceSlice';
import { fetchCategories } from '../../features/categories/categorySlice';

const initialFormState = {
  serviceName: '',
  categoryId: '',
  icon: '',
  isActive: true,
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    dispatch(fetchServices());
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
    svc.serviceName?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddService = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setFormData({
      serviceName: service.serviceName || '',
      categoryId: service.categoryId || '',
      icon: service.icon || '',
      isActive: service.isActive ?? true,
    });
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

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showAddModal) {
      dispatch(createService(formData));
    } else if (showEditModal && selectedService) {
      dispatch(updateService({ id: selectedService.id, serviceData: formData }));
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
          <Button type="primary" onClick={handleAddService}>Thêm dịch vụ</Button>
        </div>
        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
          <div className="top-search me-2">
            <div className="top-search-group">
              <span className="input-icon">
                <i className="ti ti-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm dịch vụ"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </div>
        {loading ? <Spin /> : (
          <div className="custom-datatable-filter table-responsive">
            <table className="table datatable">
              <thead className="thead-light">
                <tr>
                  <th>Tên dịch vụ</th>
                  <th>Danh mục</th>
                  <th>Icon</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentServices.map((svc) => {
                  const category = categories.find(cat => cat.id === svc.categoryId);
                  return (
                    <tr key={svc.id}>
                      <td>{svc.serviceName}</td>
                      <td>{category ? category.categoryName : ''}</td>
                      <td>{svc.icon}</td>
                      <td>
                        <span className={`badge ${svc.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {svc.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <Button size="small" onClick={() => handleEditService(svc)} style={{ marginRight: 8 }}>Sửa</Button>
                        <Button size="small" danger onClick={() => handleDeleteService(svc)}>Xóa</Button>
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
        title={showAddModal ? 'Thêm dịch vụ' : 'Sửa dịch vụ'}
        open={showAddModal || showEditModal}
        onCancel={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        footer={null}
        destroyOnClose
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên dịch vụ</label>
            <input
              type="text"
              className="form-control"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Danh mục</label>
            <select
              className="form-control"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Icon</label>
            <input
              type="text"
              className="form-control"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Trạng thái</label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            /> Hoạt động
          </div>
          <div className="d-flex justify-content-end">
            <Button onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {showAddModal ? 'Thêm' : 'Lưu'}
            </Button>
          </div>
        </form>
      </Modal>
      {/* Modal Xóa */}
      <Modal
        title="Xóa dịch vụ"
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onOk={confirmDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <p>Bạn có chắc chắn muốn xóa dịch vụ này?</p>
      </Modal>
    </div>
  );
};

export default ServiceManagement; 