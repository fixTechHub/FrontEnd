import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin, Select } from 'antd';
import {
 fetchCommissionConfigs,
 createCommissionConfig,
 updateCommissionConfig,
 deleteCommissionConfig,
 resetState,
 fetchDeletedCommissionConfigs,
 restoreCommissionConfig,
} from '../../features/commissionConfig/commissionSlice';
import "../../../public/css/ManagementTableStyle.css";
import { EyeOutlined, EditOutlined } from '@ant-design/icons';

const initialFormState = {
  name: '',
  value: '',
  isActive: true,
};

const CommissionConfigManagement = () => {
  const dispatch = useDispatch();
  const commissionConfigState = useSelector((state) => state.commissionConfig) || {};
  const { commissionConfigs = [], loading = false, error = null, success = false } = commissionConfigState;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommissionConfig, setSelectedCommissionConfig] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const configsPerPage = 10;
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState();
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    dispatch(fetchCommissionConfigs());
    dispatch(fetchDeletedCommissionConfigs());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error.title || 'Đã có lỗi xảy ra. Vui lòng thử lại!');
      dispatch(resetState());
    }
    if (success) {
      message.success('Thao tác thành công!');
      setShowAddModal(false);
      setShowEditModal(false);
      setShowDeleteModal(false);
      dispatch(resetState());
      dispatch(fetchCommissionConfigs());
    }
  }, [error, success, dispatch]);

  const filteredConfigs = commissionConfigs.filter(cfg =>
    cfg.name?.toLowerCase().includes(searchText.toLowerCase()) &&
    (!filterStatus || (filterStatus === 'ACTIVE' ? cfg.isActive : !cfg.isActive))
  );

  const sortedConfigs = [...filteredConfigs].sort((a, b) => {
    if (sortField === 'name') {
      if (!a.name) return 1;
      if (!b.name) return -1;
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    } else if (sortField === 'createdAt' || sortField === 'lasted') {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const indexOfLastConfig = currentPage * configsPerPage;
  const indexOfFirstConfig = indexOfLastConfig - configsPerPage;
  const currentConfigs = sortedConfigs.slice(indexOfFirstConfig, indexOfLastConfig);

  const totalPages = Math.ceil(filteredConfigs.length / configsPerPage);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const processErrors = (apiErrors) => {
    const newErrors = {};
    const generalErrors = [];
    Object.entries(apiErrors).forEach(([key, msgs]) => {
      const mappedKey = key === 'Name' ? 'Name' : key === 'Value' ? 'Value' : key;
      const isTechError = msgs.some(msg =>
        msg.includes('could not be converted') || msg.includes('System.')
      );
      if (isTechError) {
        generalErrors.push('Nhập vào các trường * bắt buộc');
      } else if ([ 'Name', 'Value' ].includes(mappedKey)) {
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
    if (!formData.name || !formData.value) {
      setValidationErrors({ general: 'Nhập vào các trường * bắt buộc' });
      return;
    }
    if (showAddModal) {
      dispatch(createCommissionConfig(formData)).then((action) => {
        if (action.payload && action.payload.errors) {
          const apiErrors = action.payload.errors;
          const processed = processErrors(apiErrors);
          setValidationErrors(processed);
        }
      });
    } else if (showEditModal && selectedCommissionConfig) {
      dispatch(updateCommissionConfig({ id: selectedCommissionConfig.id, commissionConfigData: formData })).then((action) => {
        if (action.payload && action.payload.errors) {
          const apiErrors = action.payload.errors;
          const processed = processErrors(apiErrors);
          setValidationErrors(processed);
        }
      });
    }
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

  const handleSortByName = () => {
    if (sortField === 'name') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('name');
      setSortOrder('asc');
    }
  };

  const handleAddConfig = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };

  const handleEditConfig = (config) => {
    setSelectedCommissionConfig(config);
    setFormData({
      name: config.name || '',
      value: config.value || '',
      isActive: config.isActive ?? true,
    });
    setShowEditModal(true);
  };

  const handleDeleteConfig = (config) => {
    setSelectedCommissionConfig(config);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedCommissionConfig) {
      dispatch(deleteCommissionConfig(selectedCommissionConfig.id));
    }
  };

  const deletedCommissionConfigs = useSelector((state) => state.commissionConfig.deletedCommissionConfigs) || [];

  const handleRestoreConfig = async (id) => {
    await dispatch(restoreCommissionConfig(id));
    setShowRestoreModal(false);
  };

  const handleOpenRestoreModal = () => {
    dispatch(fetchDeletedCommissionConfigs());
    setShowRestoreModal(true);
  };

  const isDataReady = commissionConfigs.length > 0;

  return (
    <div className="modern-page-wrapper">
      <div className="modern-content-card">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Commission Config Management</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item active">Commission Configs</li>
              </ol>
            </nav>
          </div>
          <div>
            <Button type="primary" onClick={handleAddConfig}>Add Config</Button>
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
          <div className="d-flex align-items-center" style={{ gap: 12 }}>
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
                    CONFIG NAME
                    {sortField === 'name' && (
                      <span style={{ marginLeft: 4 }}>
                        {sortOrder === 'asc' ? '\u25b2' : '\u25bc'}
                      </span>
                    )}
                  </th>
                  <th>VALUE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {!isDataReady ? (
                  <tr>
                    <td colSpan={4} className="text-center">Loading...</td>
                  </tr>
                ) : (
                  currentConfigs.map((cfg) => (
                    <tr key={cfg.id}>
                      <td>{cfg.name}</td>
                      <td>{cfg.value}</td>
                      <td>
                        <span className={`badge ${cfg.isActive ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                          {cfg.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>
                        <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => handleEditConfig(cfg)} style={{ marginRight: 8 }}>
                          Edit
                        </Button>
                        <Button className="management-action-btn" size="middle" danger onClick={() => handleDeleteConfig(cfg)}>Delete</Button>
                      </td>
                    </tr>
                  ))
                )}
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
      {/* Add Modal */}
      <Modal
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
        title="Add Commission Config"
      >
        <form onSubmit={handleSubmit}>
          {validationErrors.general && (
            <div style={{ color: 'red', marginBottom: 8 }}>{validationErrors.general}</div>
          )}
          <div className="mb-3">
            <label className="form-label">Config Name</label>
            <input
              type="text"
              name="name"
              className={`form-control${validationErrors.Name ? ' is-invalid' : ''}`}
              value={formData.name}
              onChange={handleChange}
              required
            />
            {validationErrors.Name && (
              <div className="invalid-feedback">{validationErrors.Name.join(', ')}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Value</label>
            <input
              type="text"
              name="value"
              className={`form-control${validationErrors.Value ? ' is-invalid' : ''}`}
              value={formData.value}
              onChange={handleChange}
            />
            {validationErrors.Value && (
              <div className="invalid-feedback">{validationErrors.Value.join(', ')}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Status</label>
            <div>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                id="isActiveSwitch"
              />
              <label htmlFor="isActiveSwitch" style={{ marginLeft: 8 }}>{formData.isActive ? 'Active' : 'Inactive'}</label>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-light me-2" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </Modal>
      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
        title="Update Commission Config"
      >
        <form onSubmit={handleSubmit}>
          {validationErrors.general && (
            <div style={{ color: 'red', marginBottom: 8 }}>{validationErrors.general}</div>
          )}
          <div className="mb-3">
            <label className="form-label">Config Name</label>
            <input
              type="text"
              name="name"
              className={`form-control${validationErrors.Name ? ' is-invalid' : ''}`}
              value={formData.name}
              onChange={handleChange}
              required
            />
            {validationErrors.Name && (
              <div className="invalid-feedback">{validationErrors.Name.join(', ')}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Value</label>
            <input
              type="text"
              name="value"
              className={`form-control${validationErrors.Value ? ' is-invalid' : ''}`}
              value={formData.value}
              onChange={handleChange}
            />
            {validationErrors.Value && (
              <div className="invalid-feedback">{validationErrors.Value.join(', ')}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Status</label>
            <div>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                id="isActiveSwitchEdit"
              />
              <label htmlFor="isActiveSwitchEdit" style={{ marginLeft: 8 }}>{formData.isActive ? 'Active' : 'Inactive'}</label>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-light me-2" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </Modal>
      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        footer={null}
        title="Delete Commission Config"
      >
        <div className="modal-body text-center">
          <i className="ti ti-trash-x fs-26 text-danger mb-3 d-inline-block"></i>
          <h4 className="mb-1">Delete Commission Config</h4>
          <p className="mb-3">Bạn có chắc muốn xóa cấu hình này?</p>
          <div className="d-flex justify-content-center">
            <button type="button" className="btn btn-light me-3" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </div>
        </div>
      </Modal>
      {/* Restore Modal */}
      <Modal
        open={showRestoreModal}
        onCancel={() => setShowRestoreModal(false)}
        footer={null}
        title="Restore Commission Config"
        width={800}
      >
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>NAME</th>
                <th>VALUE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {deletedCommissionConfigs.map((cfg) => (
                <tr key={cfg.id}>
                  <td>{cfg.name}</td>
                  <td>{cfg.value}</td>
                  <td>
                    <span className={`badge ${cfg.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {cfg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Button size="small" type="primary" onClick={() => handleRestoreConfig(cfg.id)}>
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
    </div>
  );
};

export default CommissionConfigManagement; 