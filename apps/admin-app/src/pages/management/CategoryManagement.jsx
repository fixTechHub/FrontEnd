import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin } from 'antd';
import {
 fetchCategories,
 createCategory,
 updateCategory,
 deleteCategory,
 resetState,
} from '../../features/categories/categorySlice';


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


 const handlePageChange = (page) => {
   setCurrentPage(page);
 };


 useEffect(() => {
   dispatch(fetchCategories());
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
   cat.categoryName?.toLowerCase().includes(searchText.toLowerCase())
 );


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
     console.log('Update/Delete category id:', selectedCategory.id);
     dispatch(deleteCategory(selectedCategory.id));
   }
 };


 const indexOfLastCategory = currentPage * categoriesPerPage;
 const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
 const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);


 const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
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
     dispatch(createCategory(formData));
   } else if (showEditModal && selectedCategory) {
     dispatch(updateCategory({ id: selectedCategory.id, categoryData: formData }));
   }
 };


 console.log('categories:', categories);


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
         <Button type="primary" onClick={handleAddCategory}>Thêm danh mục</Button>
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
               placeholder="Tìm kiếm danh mục"
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
                 <th>Tên danh mục</th>
                 <th>Icon</th>
                 <th>Trạng thái</th>
                 <th>Hành động</th>
               </tr>
             </thead>
             <tbody>
               {currentCategories.map((cat) => (
                 <tr key={cat.id}>
                   <td>{cat.categoryName}</td>
                   <td>{cat.icon}</td>
                   <td>
                     <span className={`badge ${cat.isActive ? 'bg-success' : 'bg-danger'}`}>
                       {cat.isActive ? 'Active' : 'Inactive'}
                     </span>
                   </td>
                   <td>
                     <Button size="small" onClick={() => handleEditCategory(cat)} style={{ marginRight: 8 }}>Sửa</Button>
                     <Button size="small" danger onClick={() => handleDeleteCategory(cat)}>Xóa</Button>
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


     {/* Add Modal */}
     <Modal
       open={showAddModal}
       onCancel={() => setShowAddModal(false)}
       footer={null}
       title="Thêm danh mục"
     >
       <form onSubmit={handleSubmit}>
         <div className="mb-3">
           <label className="form-label">Tên danh mục</label>
           <input
             type="text"
             name="categoryName"
             className="form-control"
             value={formData.categoryName}
             onChange={handleChange}
             required
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Icon</label>
           <input
             type="text"
             name="icon"
             className="form-control"
             value={formData.icon}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Trạng thái</label>
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
           <button type="button" className="btn btn-light me-2" onClick={() => setShowAddModal(false)}>Hủy</button>
           <button type="submit" className="btn btn-primary">Lưu</button>
         </div>
       </form>
     </Modal>


     {/* Edit Modal */}
     <Modal
       open={showEditModal}
       onCancel={() => setShowEditModal(false)}
       footer={null}
       title="Cập nhật danh mục"
     >
       <form onSubmit={handleSubmit}>
         <div className="mb-3">
           <label className="form-label">Tên danh mục</label>
           <input
             type="text"
             name="categoryName"
             className="form-control"
             value={formData.categoryName}
             onChange={handleChange}
             required
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Icon</label>
           <input
             type="text"
             name="icon"
             className="form-control"
             value={formData.icon}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Trạng thái</label>
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
           <button type="button" className="btn btn-light me-2" onClick={() => setShowEditModal(false)}>Hủy</button>
           <button type="submit" className="btn btn-primary">Lưu</button>
         </div>
       </form>
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
   </div>
 );
};


export default CategoryManagement;

