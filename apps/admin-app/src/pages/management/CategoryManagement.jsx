import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin, Select } from 'antd';
import {
 fetchCategories,
 createCategory,
 updateCategory,
 deleteCategory,
 resetState,
 fetchDeletedCategories,
 restoreCategory,
} from '../../features/categories/categorySlice';
import './ManagementTableStyle.css';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';


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
  setShowAddModal(true);
};

const handleEditCategory = (category) => {
  setSelectedCategory(category);
  setFormData({
    categoryName: category.categoryName || '',
    icon: category.icon || '',
    isActive: category.isActive ?? true,
  });
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

const deletedCategories = useSelector((state) => state.categories.deletedCategories) || [];

const handleRestoreCategory = async (id) => {
  await dispatch(restoreCategory(id));
  setShowRestoreModal(false);
};

const handleOpenRestoreModal = () => {
  dispatch(fetchDeletedCategories());
  setShowRestoreModal(true);
};


 console.log('categories:', categories);

const isDataReady = categories.length > 0;

 return (
   <div className="modern-page-wrapper">
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
                 currentCategories.map((cat) => (
                   <tr key={cat.id}>
                     <td>{cat.categoryName}</td>
                     <td>{cat.icon}</td>
                     <td>
                       <span className={`badge ${cat.isActive ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                         {cat.isActive ? 'ACTIVE' : 'INACTIVE'}
                       </span>
                     </td>
                     <td>
                       <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => handleEditCategory(cat)} style={{ marginRight: 8 }}>
                        Edit
                      </Button>
                       <Button className="management-action-btn" size="middle" danger onClick={() => handleDeleteCategory(cat)}>Delete</Button>
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
       title="Add Category"
     >
       <form onSubmit={handleSubmit}>
         {validationErrors.general && (
           <div style={{ color: 'red', marginBottom: 8 }}>{validationErrors.general}</div>
         )}
         <div className="mb-3">
           <label className="form-label">Category Name</label>
           <input
             type="text"
             name="categoryName"
             className={`form-control${validationErrors.CategoryName ? ' is-invalid' : ''}`}
             value={formData.categoryName}
             onChange={handleChange}
             required
           />
           {validationErrors.CategoryName && (
             <div className="invalid-feedback">{validationErrors.CategoryName.join(', ')}</div>
           )}
         </div>
         <div className="mb-3">
           <label className="form-label">Icon</label>
           <input
             type="text"
             name="icon"
             className={`form-control${validationErrors.Icon ? ' is-invalid' : ''}`}
             value={formData.icon}
             onChange={handleChange}
           />
           {validationErrors.Icon && (
             <div className="invalid-feedback">{validationErrors.Icon.join(', ')}</div>
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
       title="Update category"
     >
       <form onSubmit={handleSubmit}>
         {validationErrors.general && (
           <div style={{ color: 'red', marginBottom: 8 }}>{validationErrors.general}</div>
         )}
         <div className="mb-3">
           <label className="form-label">Category Name</label>
           <input
             type="text"
             name="categoryName"
             className={`form-control${validationErrors.CategoryName ? ' is-invalid' : ''}`}
             value={formData.categoryName}
             onChange={handleChange}
             required
           />
           {validationErrors.CategoryName && (
             <div className="invalid-feedback">{validationErrors.CategoryName.join(', ')}</div>
           )}
         </div>
         <div className="mb-3">
           <label className="form-label">Icon</label>
           <input
             type="text"
             name="icon"
             className={`form-control${validationErrors.Icon ? ' is-invalid' : ''}`}
             value={formData.icon}
             onChange={handleChange}
           />
           {validationErrors.Icon && (
             <div className="invalid-feedback">{validationErrors.Icon.join(', ')}</div>
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
       title="Delete category"
     >
       <div className="modal-body text-center">
         <i className="ti ti-trash-x fs-26 text-danger mb-3 d-inline-block"></i>
         <h4 className="mb-1">Delete category</h4>
         <p className="mb-3">Bạn có chắc muốn xóa danh mục này?</p>
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
       title="Restore Category"
       width={800}
     >
       <div className="custom-datatable-filter table-responsive">
         <table className="table datatable">
           <thead className="thead-light">
             <tr>
               <th>NAME</th>
               <th>ICON</th>
               <th>STATUS</th>
               <th>ACTION</th>
             </tr>
           </thead>
           <tbody>
             {deletedCategories.map((cat) => (
               <tr key={cat.id}>
                 <td>{cat.categoryName}</td>
                 <td>{cat.icon}</td>
                 <td>
                   <span className={`badge ${cat.isActive ? 'bg-success' : 'bg-danger'}`}>
                     {cat.isActive ? 'Active' : 'Inactive'}
                   </span>
                 </td>
                 <td>
                   <Button size="small" type="primary" onClick={() => handleRestoreCategory(cat.id)}>
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

