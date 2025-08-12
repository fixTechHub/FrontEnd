import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin, Select, Row, Col, Form, Input, Switch, InputNumber, DatePicker } from 'antd';
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
import dayjs from 'dayjs';
import { createExportData, formatDateTime, formatCurrency } from '../../utils/exportUtils';

const initialFormState = {
  commissionPercent: '',
  holdingPercent: '',
  commissionMinAmount: '',
  commissionType: 'PERCENT',
  startDate: '',
  isApplied: false,
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
  const [sortField, setSortField] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterInApplied, setFilterInApplied] = useState();
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
      // Hiển thị thông báo lỗi cụ thể cho trường hợp không thể xóa config đang được áp dụng
      if (error.title && error.title.includes('Không thể xóa cấu hình hoa hồng đang được áp dụng')) {
        message.error('Không thể xóa cấu hình hoa hồng đang được áp dụng. Vui lòng bỏ áp dụng trước khi xóa.');
      } else {
        message.error(error.title || 'Đã có lỗi xảy ra. Vui lòng thử lại!');
      }
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
    (!filterInApplied || (filterInApplied === 'APPLIED' ? cfg.isApplied : !cfg.isApplied)) &&
    (cfg.commissionType || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const sortedConfigs = [...filteredConfigs].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    if (sortField === 'startDate') {
      aValue = aValue ? new Date(aValue) : new Date(0);
      bValue = bValue ? new Date(bValue) : new Date(0);
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (sortField === 'commissionPercent' || sortField === 'holdingPercent' || sortField === 'commissionMinAmount') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (sortField === 'commissionType') {
      return sortOrder === 'asc' ? (aValue || '').localeCompare(bValue || '') : (bValue || '').localeCompare(aValue || '');
    }
    if (sortField === 'isApplied') {
      return sortOrder === 'asc' ? (aValue === bValue ? 0 : aValue ? -1 : 1) : (aValue === bValue ? 0 : aValue ? 1 : -1);
    }
    return 0;
  });

  const indexOfLastConfig = currentPage * configsPerPage;
  const indexOfFirstConfig = indexOfLastConfig - configsPerPage;
  const currentConfigs = sortedConfigs.slice(indexOfFirstConfig, indexOfLastConfig);

  // Set export data và columns
  useEffect(() => {
    const exportColumns = [
      { title: 'Phần trăm hoa hồng', dataIndex: 'commissionPercent' },
      { title: 'Phần trăm giữ lại', dataIndex: 'holdingPercent' },
      { title: 'Số tiền hoa hồng tối thiểu', dataIndex: 'commissionMinAmount' },
      { title: 'Loại hoa hồng', dataIndex: 'commissionType' },
      { title: 'Ngày bắt đầu', dataIndex: 'startDate' },
      { title: 'Trạng thái', dataIndex: 'status' },
      { title: 'Thời gian tạo', dataIndex: 'createdAt' },
    ];

    const exportData = sortedConfigs.map(config => ({
      commissionPercent: `${config.commissionPercent}%`,
      holdingPercent: `${config.holdingPercent}%`,
      commissionMinAmount: formatCurrency(config.commissionMinAmount),
      commissionType: config.commissionType,
      startDate: formatDateTime(config.startDate),
      status: config.isApplied ? 'APPLIED' : 'NOT APPLIED',
      createdAt: formatDateTime(config.createdAt),
      updatedAt: formatDateTime(config.updatedAt),
    }));

    createExportData(exportData, exportColumns, 'commission_configs_export', 'Commission Configs');
  }, [sortedConfigs]);

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
    if (
      formData.commissionPercent === '' ||
      formData.holdingPercent === '' ||
      formData.commissionMinAmount === '' ||
      !formData.commissionType ||
      !formData.startDate
    ) {
      setValidationErrors({ general: 'Nhập vào các trường * bắt buộc' });
      return;
    }
    if (showAddModal) {
      dispatch(createCommissionConfig(formData)).then((action) => {
        if (action.payload && action.payload.errors) {
          const apiErrors = action.payload.errors;
          setValidationErrors(apiErrors);
        }
      });
    } else if (showEditModal && selectedCommissionConfig) {
      dispatch(updateCommissionConfig({ id: selectedCommissionConfig.id, commissionConfigData: formData })).then((action) => {
        if (action.payload && action.payload.errors) {
          const apiErrors = action.payload.errors;
          setValidationErrors(apiErrors);
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
    setValidationErrors({});
    setShowAddModal(true);
  };

  const handleEditConfig = (config) => {
    setSelectedCommissionConfig(config);
    setFormData({
      commissionPercent: config.commissionPercent ?? '',
      holdingPercent: config.holdingPercent ?? '',
      commissionMinAmount: config.commissionMinAmount ?? '',
      commissionType: config.commissionType ?? 'PERCENT',
      startDate: config.startDate ? config.startDate.slice(0, 10) : '',
      isApplied: config.isApplied ?? false,
    });
    setValidationErrors({});
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field) => sortField === field ? (
    <span style={{ marginLeft: 4 }}>{sortOrder === 'asc' ? '\u25b2' : '\u25bc'}</span>
  ) : null;

  return (
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Quản lý hoa hồng</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
                <li className="breadcrumb-item active">Cấu hình hoa hồng</li>
              </ol>
            </nav>
          </div>
          <div>
            <Button type="primary" onClick={handleAddConfig}>Thêm</Button>
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
                  placeholder="Tìm kiếm"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>
            </div>
            <Select
              placeholder="Trạng thái"
              value={filterInApplied || undefined}
              onChange={value => setFilterInApplied(value)}
              style={{ width: 130 }}
              allowClear
            >
              <Select.Option value="APPLIED">APPLIED</Select.Option>
              <Select.Option value="NOT_APPLIED">NOT APPLIED</Select.Option>
            </Select>
          </div>
          <div className="d-flex align-items-center" style={{ gap: 12 }}>
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
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('commissionPercent')}>
                    Hoa hồng % {renderSortIcon('commissionPercent')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('holdingPercent')}>
                    Giữ lại % {renderSortIcon('holdingPercent')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('commissionMinAmount')}>
                    Số tiền tối thiểu {renderSortIcon('commissionMinAmount')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('commissionType')}>
                    Phân loại {renderSortIcon('commissionType')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('startDate')}>
                    Ngày bắt đầu {renderSortIcon('startDate')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('isApplied')}>
                    Trạng thái {renderSortIcon('isApplied')}
                  </th>
                  <th>Hàng động</th>
                </tr>
              </thead>
              <tbody>
                {!isDataReady ? (
                  <tr>
                    <td colSpan={7} className="text-center">Đang tải...</td>
                  </tr>
                ) : (
                  currentConfigs.map((cfg) => (
                    <tr key={cfg.id}>
                      <td>{cfg.commissionPercent}</td>
                      <td>{cfg.holdingPercent}</td>
                      <td>{cfg.commissionMinAmount}</td>
                      <td>{cfg.commissionType}</td>
                      <td>{cfg.startDate ? dayjs(cfg.startDate).format('DD/MM/YYYY') : ''}</td>
                      <td>
                        <span className={`badge ${cfg.isApplied ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                          {cfg.isApplied ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => handleEditConfig(cfg)} style={{ marginRight: 8 }}>
                          Chỉnh sửa
                        </Button>
                        <Button 
                          className="management-action-btn" 
                          size="middle" 
                          danger 
                          disabled={cfg.isApplied}
                          onClick={() => handleDeleteConfig(cfg)}
                          title={cfg.isApplied ? 'Không thể xóa cấu hình đang được áp dụng' : 'Xóa cấu hình'}
                        >
                          Xóa
                        </Button>
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
        title="Thêm cấu hình hoa hồng"
        width={700}
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
              <Form.Item label="Phần trăm hoa hồng (%)" required validateStatus={validationErrors.CommissionPercent ? 'error' : ''} help={validationErrors.CommissionPercent ? validationErrors.CommissionPercent.join(', ') : ''}>
                <InputNumber
                  name="commissionPercent"
                  value={formData.commissionPercent}
                  onChange={(value) => handleChange({ target: { name: 'commissionPercent', value: value?.toString() || '' } })}
                  min={0}
                  max={100}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="Nhập phần trăm hoa hồng"
                  required
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phần trăm giữ lại (%)" required validateStatus={validationErrors.HoldingPercent ? 'error' : ''} help={validationErrors.HoldingPercent ? validationErrors.HoldingPercent.join(', ') : ''}>
                <InputNumber
                  name="holdingPercent"
                  value={formData.holdingPercent}
                  onChange={(value) => handleChange({ target: { name: 'holdingPercent', value: value?.toString() || '' } })}
                  min={0}
                  max={100}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="Nhập phần trăm giữ lại"
                  required
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số tiền tối thiểu (VND)" required validateStatus={validationErrors.CommissionMinAmount ? 'error' : ''} help={validationErrors.CommissionMinAmount ? validationErrors.CommissionMinAmount.join(', ') : ''}>
                <InputNumber
                  name="commissionMinAmount"
                  value={formData.commissionMinAmount}
                  onChange={(value) => handleChange({ target: { name: 'commissionMinAmount', value: value?.toString() || '' } })}
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="Nhập số tiền tối thiểu"
                  required
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Loại hoa hồng" required validateStatus={validationErrors.CommissionType ? 'error' : ''} help={validationErrors.CommissionType ? validationErrors.CommissionType.join(', ') : ''}>
                <Select
                  name="commissionType"
                  value={formData.commissionType}
                  onChange={(value) => handleChange({ target: { name: 'commissionType', value } })}
                  placeholder="Chọn loại hoa hồng"
                  required
                >
                  <Select.Option value="PERCENT">PERCENT</Select.Option>
                  <Select.Option value="MIN_AMOUNT">MIN_AMOUNT</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày bắt đầu" required validateStatus={validationErrors.StartDate ? 'error' : ''} help={validationErrors.StartDate ? validationErrors.StartDate.join(', ') : ''}>
                <DatePicker
                  value={formData.startDate ? dayjs(formData.startDate) : null}
                  onChange={(date, dateString) => handleChange({ target: { name: 'startDate', value: dateString } })}
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày bắt đầu"
                  required
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái">
                <Switch
                  name="isApplied"
                  checked={formData.isApplied}
                  onChange={(checked) => handleChange({ target: { name: 'isApplied', type: 'checkbox', checked } })}
                  checkedChildren="Applied"
                  unCheckedChildren="Not Applied"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button onClick={() => setShowAddModal(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              Thêm
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
        title="Cập nhật cấu hình hoa hồng"
        width={700}
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
              <Form.Item label="Phần trăm hoa hồng (%)" required validateStatus={validationErrors.CommissionPercent ? 'error' : ''} help={validationErrors.CommissionPercent ? validationErrors.CommissionPercent.join(', ') : ''}>
                <InputNumber
                  name="commissionPercent"
                  value={formData.commissionPercent}
                  onChange={(value) => handleChange({ target: { name: 'commissionPercent', value: value?.toString() || '' } })}
                  min={0}
                  max={100}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="Nhập phần trăm hoa hồng"
                  required
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phần trăm giữ lại (%)" required validateStatus={validationErrors.HoldingPercent ? 'error' : ''} help={validationErrors.HoldingPercent ? validationErrors.HoldingPercent.join(', ') : ''}>
                <InputNumber
                  name="holdingPercent"
                  value={formData.holdingPercent}
                  onChange={(value) => handleChange({ target: { name: 'holdingPercent', value: value?.toString() || '' } })}
                  min={0}
                  max={100}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="Nhập phần trăm giữ lại"
                  required
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số tiền tối thiểu (VND)" required validateStatus={validationErrors.CommissionMinAmount ? 'error' : ''} help={validationErrors.CommissionMinAmount ? validationErrors.CommissionMinAmount.join(', ') : ''}>
                <InputNumber
                  name="commissionMinAmount"
                  value={formData.commissionMinAmount}
                  onChange={(value) => handleChange({ target: { name: 'commissionMinAmount', value: value?.toString() || '' } })}
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="Nhập số tiền tối thiểu"
                  required
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Loại hoa hồng" required validateStatus={validationErrors.CommissionType ? 'error' : ''} help={validationErrors.CommissionType ? validationErrors.CommissionType.join(', ') : ''}>
                <Select
                  name="commissionType"
                  value={formData.commissionType}
                  onChange={(value) => handleChange({ target: { name: 'commissionType', value } })}
                  placeholder="Chọn loại hoa hồng"
                  required
                >
                  <Select.Option value="PERCENT">PERCENT</Select.Option>
                  <Select.Option value="MIN_AMOUNT">MIN_AMOUNT</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày bắt đầu" required validateStatus={validationErrors.StartDate ? 'error' : ''} help={validationErrors.StartDate ? validationErrors.StartDate.join(', ') : ''}>
                <DatePicker
                  value={formData.startDate ? dayjs(formData.startDate) : null}
                  onChange={(date, dateString) => handleChange({ target: { name: 'startDate', value: dateString } })}
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày bắt đầu"
                  required
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái">
                <Switch
                  name="isApplied"
                  checked={formData.isApplied}
                  onChange={(checked) => handleChange({ target: { name: 'isApplied', type: 'checkbox', checked } })}
                  checkedChildren="Applied"
                  unCheckedChildren="Not Applied"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button onClick={() => setShowEditModal(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        footer={null}
        title="Xóa cấu hình hoa hồng"
      >
        <div className="modal-body text-center">
          <i className="ti ti-trash-x fs-26 text-danger mb-3 d-inline-block"></i>
          <h4 className="mb-1">Xóa cấu hình hoa hồng</h4>
          <p className="mb-3">Bạn có chắc muốn xóa cấu hình này?</p>
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
        title="Khôi phục"
        width={800}
      >
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>Hoa hồng %</th>
                <th>Giữ lại %</th>
                <th>Số tiền tối thiểu</th>
                <th>Ngày bắt đầu</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {deletedCommissionConfigs.map((cfg) => (
                <tr key={cfg.id}>
                  <td>{cfg.commissionPercent}</td>
                  <td>{cfg.holdingPercent}</td>
                  <td>{cfg.commissionMinAmount}</td>
                  <td>{cfg.startDate ? dayjs(cfg.startDate).format('DD/MM/YYYY') : ''}</td>
                  <td>
                    <span className={`badge ${cfg.isApplied ? 'bg-success' : 'bg-danger'}`}>
                      {cfg.isApplied ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <Button size="small" type="primary" onClick={() => handleRestoreConfig(cfg.id)}>
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

export default CommissionConfigManagement;