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
    { title: 'Category Name', dataIndex: 'categoryName' },
    { title: 'Icon', dataIndex: 'icon' },
    { title: 'Status', dataIndex: 'isActive' },
    { title: 'Created At', dataIndex: 'createdAt' },
  ];

  const exportData = categories.map(cat => ({
    categoryName: cat.categoryName,
    icon: cat.icon,
    isActive: cat.isActive ? 'Active' : 'Inactive',
    createdAt: formatDateTime(cat.createdAt),
  }));

  window.currentPageExportData = exportData;
  window.currentPageExportColumns = exportColumns;
  window.currentPageExportFileName = 'categories_export';
  window.currentPageExportTitle = 'Categories';
}, [categories]);

 const handleChange = (e) => {
   const { name, value, type, checked } = e.target;
   setFormData(prev => ({
     ...prev,
     [name]: type === 'checkbox' ? checked : value
   }));
   // Clear validation error when user starts typing
   if (validationErrors[name]) {
     setValidationErrors(prev => ({ ...prev, [name]: null }));
   }
 };

const processErrors = (apiErrors) => {
  const errors = {};
  if (apiErrors && typeof apiErrors === 'object') {
    Object.keys(apiErrors).forEach(key => {
      if (Array.isArray(apiErrors[key])) {
        errors[key] = apiErrors[key][0];
      } else {
        errors[key] = apiErrors[key];
      }
    });
  }
  return errors;
};

const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validation
  const errors = {};
  if (!formData.categoryName.trim()) {
    errors.categoryName = 'Category name is required';
  }
  
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    return;
  }

  if (selectedCategory) {
    // Update
    dispatch(updateCategory({ id: selectedCategory.id, categoryData: formData }));
  } else {
    // Create
    dispatch(createCategory(formData));
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
   setSortField('categoryName');
   setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
 };

const handleAddCategory = () => {
  setSelectedCategory(null);
  setFormData(initialFormState);
  setValidationErrors({});
  setShowAddModal(true);
};

const handleEditCategory = (category) => {
  setSelectedCategory(category);
  setFormData({
    categoryName: category.categoryName || '',
    icon: category.icon || '',
    isActive: category.isActive !== undefined ? category.isActive : true,
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
    dispatch(deleteCategory(selectedCategory.id));
  }
};

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
           <h4 className="mb-1">Category Management</h4>
           <nav>
             <ol className="breadcrumb mb-0">
               <li className="breadcrumb-item"><a href="/admin">Home</a></li>
               <li className="breadcrumb-item active">Categories</li>
             </ol>
           </nav>
         </div>
         <div>
           <Button type="primary" onClick={handleAddCategory}>Add Category</Button>
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
               {!isDataReady ? (
                 <tr>
                   <td colSpan={4} className="text-center">Loading...</td>
                 </tr>
               ) : (
                 currentCategories.map((category) => (
                   <tr key={category.id}>
                     <td>{category.categoryName}</td>
                     <td>
                       <IconDisplay icon={category.icon} />
                     </td>
                     <td>
                       <span className={`badge ${category.isActive ? 'bg-success' : 'bg-danger'}`}>
                         {category.isActive ? 'Active' : 'Inactive'}
                       </span>
                     </td>
                     <td>
                       <div className="d-flex gap-2">
                         <Button
                           type="text"
                           icon={<EyeOutlined />}
                           onClick={() => handleEditCategory(category)}
                           size="small"
                         />
                         <Button
                           type="text"
                           icon={<EditOutlined />}
                           onClick={() => handleEditCategory(category)}
                           size="small"
                         />
                         <Button
                           type="text"
                           danger
                           onClick={() => handleDeleteCategory(category)}
                           size="small"
                         >
                           Delete
                         </Button>
                       </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
       )}
       
       {/* Pagination */}
       {isDataReady && (
         <div className="d-flex justify-content-between align-items-center mt-3">
           <div>
             Showing {indexOfFirstCategory + 1} to {Math.min(indexOfLastCategory, filteredCategories.length)} of {filteredCategories.length} entries
           </div>
           <div>
             <Button
               disabled={currentPage === 1}
               onClick={() => handlePageChange(currentPage - 1)}
               size="small"
             >
               Previous
             </Button>
             <span className="mx-2">
               Page {currentPage} of {Math.ceil(filteredCategories.length / categoriesPerPage)}
             </span>
             <Button
               disabled={currentPage >= Math.ceil(filteredCategories.length / categoriesPerPage)}
               onClick={() => handlePageChange(currentPage + 1)}
               size="small"
             >
               Next
             </Button>
           </div>
         </div>
       )}
     </div>

     {/* Add/Edit Modal */}
     <Modal
       title={selectedCategory ? 'Edit Category' : 'Add Category'}
       open={showAddModal || showEditModal}
       onOk={handleSubmit}
       onCancel={() => {
         setShowAddModal(false);
         setShowEditModal(false);
         setSelectedCategory(null);
         setFormData(initialFormState);
         setValidationErrors({});
       }}
       okText={selectedCategory ? 'Update' : 'Add'}
       cancelText="Cancel"
       confirmLoading={loading}
     >
       <Form layout="vertical">
         <Form.Item
           label="Category Name"
           validateStatus={validationErrors.categoryName ? 'error' : ''}
           help={validationErrors.categoryName}
         >
           <Input
             name="categoryName"
             value={formData.categoryName}
             onChange={handleChange}
             placeholder="Enter category name"
           />
         </Form.Item>
         
         <Form.Item label="Icon">
           <IconUploader
             value={formData.icon}
             onChange={(icon) => setFormData(prev => ({ ...prev, icon }))}
           />
         </Form.Item>
         
         <Form.Item label="Status">
           <Switch
             checked={formData.isActive}
             onChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
             checkedChildren="Active"
             unCheckedChildren="Inactive"
           />
         </Form.Item>
       </Form>
     </Modal>

     {/* Delete Confirmation Modal */}
     <Modal
       title="Delete Category"
       open={showDeleteModal}
       onOk={confirmDelete}
       onCancel={() => {
         setShowDeleteModal(false);
         setSelectedCategory(null);
       }}
       okText="Delete"
       cancelText="Cancel"
       confirmLoading={loading}
     >
       <p>Are you sure you want to delete "{selectedCategory?.categoryName}"?</p>
     </Modal>

     {/* Restore Modal */}
     <Modal
       title="Restore Deleted Categories"
       open={showRestoreModal}
       onCancel={() => setShowRestoreModal(false)}
       footer={null}
       width={800}
     >
       <div className="table-responsive">
         <table className="table">
           <thead>
             <tr>
               <th>Category Name</th>
               <th>Icon</th>
               <th>Action</th>
             </tr>
           </thead>
           <tbody>
             {categoryState.deletedCategories?.map((cat) => (
               <tr key={cat.id}>
                 <td>{cat.categoryName}</td>
                 <td>
                   <IconDisplay icon={cat.icon} />
                 </td>
                 <td>
                   <Button
                     type="primary"
                     size="small"
                     onClick={() => handleRestoreCategory(cat.id)}
                   >
                     Restore
                   </Button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </Modal>
   </div>
 );
};

export default CategoryManagement;

