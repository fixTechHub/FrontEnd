import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin, Select, Row, Col, Form, Input, Switch } from 'antd';
import {
 fetchCategories,
 createCategory,
 updateCategory,
 deleteCategory,
 resetState,
 fetchDeletedCategories,
 restoreCategory,
} from '../../features/categories/categorySlice';
import "../../../public/css/ManagementTableStyle.css";
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { createExportData, formatDateTime } from '../../utils/exportUtils';
import IconUploader from '../../components/common/IconUploader';
import IconDisplay from '../../components/common/IconDisplay';

const initialFormState = {
 categoryName: '',
 icon: '',
 isActive: true,
};

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const categoryState = useSelector((state) => state.categories) || {};
  const { categories = [], loading = false, error = null, success = false, deletedCategories = [] } = categoryState;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 10;
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState();
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [activeKey, setActiveKey] = useState('active');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchDeletedCategories());
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
      dispatch(fetchCategories());
    }
  }, [error, success, dispatch]);

  const filteredCategories = categories.filter(cat =>
    cat.categoryName?.toLowerCase().includes(searchText.toLowerCase()) &&
    (!filterStatus || (filterStatus === 'ACTIVE' ? cat.isActive : !cat.isActive))
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortField === 'categoryName') {
      if (!a.categoryName) return 1;
      if (!b.categoryName) return -1;
      if (sortOrder === 'asc') {
        return a.categoryName.localeCompare(b.categoryName);
      } else {
        return b.categoryName.localeCompare(a.categoryName);
      }
    } else if (sortField === 'createdAt' || sortField === 'lasted') {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = sortedCategories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  // Set export data và columns
  useEffect(() => {
    const exportColumns = [
      { title: 'Category Name', dataIndex: 'categoryName' },
      { title: 'Icon', dataIndex: 'icon' },
      { title: 'Status', dataIndex: 'isActive' },
      { title: 'Created At', dataIndex: 'createdAt' },
    ];
    createExportData(currentCategories, exportColumns, 'categories');
  }, [currentCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const mapErrorKey = (key) => {
    const lower = key.toLowerCase();
    if (lower.includes('categoryname')) return 'categoryName';
    if (lower.includes('icon')) return 'icon';
    if (lower.includes('isactive')) return 'isActive';
    return key;
  };

  const processErrors = (apiErrors) => {
    const newErrors = {};
    const generalErrors = [];
    Object.entries(apiErrors).forEach(([key, msgs]) => {
      const mappedKey = mapErrorKey(key);
      const isTechError = msgs.some(msg =>
        msg.includes('could not be converted') || msg.includes('System.DateTime')
      );
      if (isTechError) {
        generalErrors.push('Nhập vào các trường * bắt buộc');
      } else if ([
        'CategoryName', 'Icon', 'IsActive'
      ].includes(mappedKey)) {
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

    // Validation
    const errors = {};
    if (!formData.categoryName || !formData.categoryName.trim()) {
      errors.categoryName = ['Category name is required'];
    }
    if (!formData.icon) {
      errors.icon = ['Icon is required'];
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const dataToSend = {
      categoryName: formData.categoryName.trim(),
      icon: formData.icon,
      isActive: formData.isActive,
    };

    try {
      if (showAddModal) {
        console.log('Creating category with data:', dataToSend);
        const action = await dispatch(createCategory(dataToSend));
        console.log('Create action result:', action);
        if (action.error) {
          console.log('Create error:', action.error);
          if (action.payload && action.payload.errors) {
            const apiErrors = action.payload.errors;
            const processed = processErrors(apiErrors);
            setValidationErrors(processed);
          } else if (action.payload && action.payload.message) {
            message.error(action.payload.message);
          } else {
            message.error('Có lỗi xảy ra khi tạo category');
          }
        } else {
          console.log('Create success');
          message.success('Tạo category thành công!');
          setShowAddModal(false);
          setFormData(initialFormState);
          setValidationErrors({});
        }
      } else if (showEditModal && selectedCategory) {
        console.log('Updating category with data:', dataToSend);
        const action = await dispatch(updateCategory({ id: selectedCategory.id, categoryData: dataToSend }));
        console.log('Update action result:', action);
        if (action.error) {
          console.log('Update error:', action.error);
          if (action.payload && action.payload.errors) {
            const apiErrors = action.payload.errors;
            const processed = processErrors(apiErrors);
            setValidationErrors(processed);
          } else if (action.payload && action.payload.message) {
            message.error(action.payload.message);
          } else {
            message.error('Có lỗi xảy ra khi cập nhật category');
          }
        } else {
          console.log('Update success');
          message.success('Cập nhật category thành công!');
          setShowEditModal(false);
          setSelectedCategory(null);
          setFormData(initialFormState);
          setValidationErrors({});
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      message.error('Có lỗi xảy ra');
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
    if (sortField === 'categoryName') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('categoryName');
      setSortOrder('asc');
    }
  };

  const handleAddCategory = () => {
    setFormData(initialFormState);
    setValidationErrors({});
    setShowAddModal(true);
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  const handleEditCategory = (category) => {
    setFormData({
      categoryName: category.categoryName || '',
      icon: category.icon || '',
      isActive: category.isActive !== undefined ? category.isActive : true,
    });
    setValidationErrors({});
    setSelectedCategory(category);
    setShowEditModal(true);
    setShowAddModal(false);
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      dispatch(deleteCategory(selectedCategory.id));
    }
  };

  const handleRestoreCategory = async (id) => {
    try {
      await dispatch(restoreCategory(id));
      message.success('Khôi phục category thành công!');
      dispatch(fetchDeletedCategories());
      dispatch(fetchCategories());
    } catch (err) {
      message.error('Khôi phục category thất bại!');
    }
  };

  const handleOpenRestoreModal = () => {
    dispatch(fetchDeletedCategories());
    setShowRestoreModal(true);
  };

  return (
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Category Management</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item active">Categories</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex">
            <Button type="primary" onClick={handleAddCategory} style={{ marginRight: 8 }}>Add category</Button>
            <Button type="default" onClick={() => setShowRestoreModal(true)}>Restore</Button>
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
                  placeholder="Search Categories"
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
                    CATEGORY NAME
                    {sortField === 'categoryName' && (
                      <span style={{ marginLeft: 4 }}>
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th>ICON</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.categoryName}</td>
                    <td>
                      <IconDisplay icon={category.icon} />
                    </td>
                    <td>
                      <span className={`badge ${category.isActive ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                        {category.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => handleEditCategory(category)} style={{ marginRight: 8 }}>
                        Edit
                      </Button>
                      <Button className="management-action-btn" size="middle" danger onClick={() => { setSelectedCategory(category); setShowDeleteModal(true); }} style={{ marginRight: 8 }}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
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

      {/* Add/Edit Modal */}
      <Modal
        open={showAddModal || showEditModal}
        onCancel={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedCategory(null);
          setFormData(initialFormState);
          setValidationErrors({});
        }}
        footer={null}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
        width={800}
      >
        <Form layout="vertical" onSubmit={handleSubmit}>
          {validationErrors.general && (
            <div style={{ color: 'red', marginBottom: 8 }}>
              {validationErrors.general.includes('The dto field is required') ||
               validationErrors.general.includes('could not be converted') ||
               validationErrors.general.includes('System.DateTime')
                ? 'Nhập vào các trường * bắt buộc'
                : validationErrors.general}
            </div>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Category Name" required validateStatus={validationErrors.categoryName ? 'error' : ''} help={validationErrors.categoryName ? validationErrors.categoryName.join(', ') : ''}>
                <Input
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  required
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Status" validateStatus={validationErrors.isActive ? 'error' : ''} help={validationErrors.isActive ? validationErrors.isActive.join(', ') : ''}>
                <Switch
                  checked={formData.isActive}
                  onChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="Icon" validateStatus={validationErrors.icon ? 'error' : ''} help={validationErrors.icon ? validationErrors.icon.join(', ') : ''}>
            <IconUploader
              value={formData.icon}
              onChange={(icon) => setFormData(prev => ({ ...prev, icon }))}
            />
          </Form.Item>
          
          <div className="d-flex justify-content-end">
            <Button type="default" onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setSelectedCategory(null);
              setFormData(initialFormState);
              setValidationErrors({});
            }} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {selectedCategory ? 'Update' : 'Add'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        footer={null}
        title="Delete category"
      >
        <div className="modal-body text-center">
          <i className="ti ti-trash-x fs-26 text-danger mb-3 d-inline-block"></i>
          <h4 className="mb-1">Delete category</h4>
          <p className="mb-3">Bạn có chắc muốn xóa category này?</p>
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
        title="Restore category"
        width={800}
      >
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>CATEGORY NAME</th>
                <th>ICON</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {deletedCategories.map((category) => (
                <tr key={category.id}>
                  <td>{category.categoryName}</td>
                  <td>
                    <IconDisplay icon={category.icon} />
                  </td>
                  <td>
                    <span className={`badge ${category.isActive ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                      {category.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td>
                    <Button size="small" type="primary" onClick={() => handleRestoreCategory(category.id)}>
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

export default CategoryManagement;