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
  const { categories = [], loading = false, error = null, success = false } = categoryState;


  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 10;
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [filterStatus, setFilterStatus] = useState();
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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
  } else if (sortField === 'createdAt' || sortField === 'lasted') { // Thêm điều kiện sortField === 'lasted'
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA; // Mặc định sort DESC cho lasted
  }
  return 0;
});

const indexOfLastCategory = currentPage * categoriesPerPage;
const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
const currentCategories = sortedCategories.slice(indexOfFirstCategory, indexOfLastCategory);

// Set export data và columns
useEffect(() => {
  const exportColumns = [
    { title: 'Tên danh mục', dataIndex: 'categoryName' },
    { title: 'Trạng thái', dataIndex: 'status' },
    { title: 'Thời gian tạo', dataIndex: 'createdAt' },
  ];

  const exportData = sortedCategories.map(category => ({
    categoryName: category.categoryName,
    icon: category.icon,
    status: category.isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: formatDateTime(category.createdAt),
    updatedAt: formatDateTime(category.updatedAt),
  }));

  createExportData(exportData, exportColumns, 'categories_export', 'Categories');
}, [sortedCategories]);

const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
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
    const mappedKey = key === 'CategoryName' ? 'CategoryName' : key === 'Icon' ? 'Icon' : key;
    const isTechError = msgs.some(msg =>
      msg.includes('could not be converted') || msg.includes('System.')
    );
    if (isTechError) {
      generalErrors.push('Nhập vào các trường * bắt buộc');
    } else if ([ 'CategoryName', 'Icon' ].includes(mappedKey)) {
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
  
  // Validation for category name length
  if (formData.categoryName && formData.categoryName.length > 100) {
    setValidationErrors({ CategoryName: ['Tên danh mục không được vượt quá 100 ký tự'] });
    message.error('Tên danh mục không được vượt quá 100 ký tự');
    return;
  }
  
  if (!formData.categoryName || !formData.icon) {
    setValidationErrors({ general: 'Nhập vào các trường * bắt buộc' });
    return;
  }
  if (showAddModal) {
    dispatch(createCategory(formData)).then((action) => {
      if (action.payload && action.payload.errors) {
        const apiErrors = action.payload.errors;
        const processed = processErrors(apiErrors);
        setValidationErrors(processed);
      }
    });
  } else if (showEditModal && selectedCategory) {
    dispatch(updateCategory({ id: selectedCategory.id, categoryData: formData })).then((action) => {
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
};

const handleEditCategory = (category) => {
  setSelectedCategory(category);
  setFormData({
    categoryName: category.categoryName || '',
    icon: category.icon || '',
    isActive: category.isActive ?? true,
  });
  setValidationErrors({});
  setShowEditModal(true);
};

const handleDeleteCategory = (category) => {
  setSelectedCategory(category);
  setShowDeleteModal(true);
};

const confirmDelete = () => {
  if (selectedCategory) {
    // Use DELETE endpoint which now properly handles soft delete
    dispatch(deleteCategory(selectedCategory.id));
  }
};

const deletedCategories = useSelector((state) => state.categories.deletedCategories) || [];

const handleRestoreCategory = async (id) => {
  await dispatch(restoreCategory(id));
  setShowRestoreModal(false);
};

const handleOpenRestoreModal = () => {
  dispatch(fetchDeletedCategories());
  setShowRestoreModal(true);
};

const isDataReady = categories.length > 0;

 return (
   <div className="modern-page- wrapper">
     <div className="modern-content-card">
       <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
         <div className="my-auto mb-2">
           <h4 className="mb-1">Quản lý danh mục</h4>
           <nav>
             <ol className="breadcrumb mb-0">
               <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
               <li className="breadcrumb-item active">Danh mục</li>
             </ol>
           </nav>
         </div>
         <div>
           <Button type="primary" onClick={handleAddCategory}>Thêm</Button>
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
                 placeholder="Tìm kiếm danh mục"
                 value={searchText}
                 onChange={e => setSearchText(e.target.value)}
               />
             </div>
           </div>
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
                 <th style={{ cursor: 'pointer' }} onClick={handleSortByName}>
                   Tên danh mục
                   {sortField === 'categoryName' && (
                     <span style={{ marginLeft: 4 }}>
                       {sortOrder === 'asc' ? '▲' : '▼'}
                     </span>
                   )}
                 </th>
                 <th>Ký hiệu</th>
                 <th>Trạng thái</th>
                 <th>Hành động</th>
                 
               </tr>
             </thead>
             <tbody>
               {!isDataReady ? (
                 <tr>
                   <td colSpan={4} className="text-center">Đang tải...</td>
                 </tr>
               ) : (
                 currentCategories.map((cat) => (
                   <tr key={cat.id}>
                     <td>{cat.categoryName}</td>
                     <td>
                       <IconDisplay icon={cat.icon} size={40} />
                     </td>
                     <td>
                       <span className={`badge ${cat.isActive ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                         {cat.isActive ? 'ACTIVE' : 'INACTIVE'}
                       </span>
                     </td>
                     <td>
                       <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => handleEditCategory(cat)} style={{ marginRight: 8 }}>
                        Chỉnh sửa
                      </Button>
                       <Button className="management-action-btn" size="middle" danger onClick={() => handleDeleteCategory(cat)}>Xóa</Button>
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
       title="Thêm danh mục"
       width={600}
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
            <Col span={16}>
              <Form.Item label="Tên danh mục" required validateStatus={validationErrors.CategoryName ? 'error' : ''} help={validationErrors.CategoryName ? validationErrors.CategoryName.join(', ') : ''}>
                <Input
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  placeholder="Nhập tên danh mục"
                  required
                  maxLength={100}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Chọn ký hiệu" required validateStatus={validationErrors.Icon ? 'error' : ''} help={validationErrors.Icon ? validationErrors.Icon.join(', ') : ''}>
                <IconUploader
                  value={formData.icon}
                  onChange={(value) => handleChange({ target: { name: 'icon', value } })}
                  placeholder="Đăng tải hình ảnh"
                />
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 6 }}>PNG/SVG, kích thước đề xuất 64x64</div>
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
       title="Cập nhật danh mục"
       width={600}
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
            <Col span={16}>
              <Form.Item label="Tên danh mục" required validateStatus={validationErrors.CategoryName ? 'error' : ''} help={validationErrors.CategoryName ? validationErrors.CategoryName.join(', ') : ''}>
                <Input
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  placeholder="Nhập tên danh mục"
                  required
                  maxLength={100}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Chọn ký hiệu" required validateStatus={validationErrors.Icon ? 'error' : ''} help={validationErrors.Icon ? validationErrors.Icon.join(', ') : ''}>
                <IconUploader
                  value={formData.icon}
                  onChange={(value) => handleChange({ target: { name: 'icon', value } })}
                  placeholder="Đăng tải hình ảnh"
                />
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 6 }}>PNG/SVG, kích thước đề xuất 64x64</div>
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
       title="Xóa danh mục"
     >
       <div className="modal-body text-center">
         <i className="ti ti-trash-x fs-26 text-danger mb-3 d-inline-block"></i>
         <h4 className="mb-1">Xóa danh mục</h4>
         <p className="mb-3">Bạn có chắc muốn xóa danh mục này?</p>
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
       title="Khôi phục danh mục"
       width={800}
     >
       <div className="custom-datatable-filter table-responsive">
         <table className="table datatable">
           <thead className="thead-light">
             <tr>
               <th>Tên danh mục</th>
               <th>Ký hiệu</th>
               <th>Trạng thái</th>
               <th>Hành động</th>
             </tr>
           </thead>
           <tbody>
             {deletedCategories.map((cat) => (
               <tr key={cat.id}>
                 <td>{cat.categoryName}</td>
                 <td>
                   <IconDisplay icon={cat.icon} size={40} />
                 </td>
                 <td>
                   <span className={`badge ${cat.isActive ? 'bg-success' : 'bg-danger'}`}>
                     {cat.isActive ? 'Active' : 'Inactive'}
                   </span>
                 </td>
                 <td>
                   <Button size="small" type="primary" onClick={() => handleRestoreCategory(cat.id)}>
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


export default CategoryManagement;