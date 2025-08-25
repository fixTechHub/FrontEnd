import React, { useEffect, useState } from "react";
import { Button, Modal, Input, Select, Switch, Form, Spin } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllPackages,
  createNewPackage,
  editPackage,
  removePackage,
  togglePackageStatus,
} from '../../features/packages/packageSlice';

const PackageManagement = () => {
  const dispatch = useDispatch();
  const { packages, deletedPackages, loading, error } = useSelector(
    (state) => state.adminPackages
  );

  // local states
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [packagesPerPage, setPackagesPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    price: "",
    description: "",
    duration: "",
    benefit: [],
    isActive: true
  });

  const [newBenefit, setNewBenefit] = useState(""); // ✅ Dùng để nhập từng benefit

  // const [selectedPackage, setSelectedPackage] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);


  // fetch initial data
  useEffect(() => {
    dispatch(fetchAllPackages());
  }, [dispatch]);

  const handleAddPackage = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      benefit: [],
      isActive: true
    });
    setShowAddModal(true);
  };


  const handleEditPackage = (service) => {
    setFormData({
      id: service._id,  // ✅ id phải có
      name: service.name,
      price: service.price,
      description: service.description,
      benefit: service.benefits || [],
      isActive: service.isActive,
    });
    setShowEditModal(true);
  };

  const handleDeletePackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    dispatch(removePackage(selectedPackage._id || selectedPackage.id));
    setShowDeleteModal(false);
  };

  const handleViewDetail = (pkg) => {
    setSelectedPackage(pkg);
    setIsDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedPackage(null);
  };

  const handleRestorePackage = (id) => {
    dispatch(togglePackageStatus(id));
  };

  const handleSubmit = () => {
    if (showAddModal) {
      dispatch(createNewPackage(formData));
    } else if (showEditModal) {
      dispatch(editPackage(formData)); // ✅ check formData có id không
    }
    if (showAddModal) {
      dispatch(createNewPackage(formData));
    } else if (showEditModal) {
      dispatch(editPackage(formData)); // ✅ check formData có id không
    }
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const handleSortChange = (value) => {
    if (value === "lasted") {
      setSortField("createdAt");
      setSortOrder("desc");
    } else {
      setSortField("createdAt");
      setSortOrder("asc");
    }
  };

  // Filter and pagination logic
  const filteredPackages = packages.filter(pkg =>
    pkg.name?.toLowerCase().includes(searchText.toLowerCase()) &&
    (!filterStatus || (filterStatus === 'ACTIVE' ? pkg.isActive : !pkg.isActive))
  );

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const indexOfLastPackage = currentPage * packagesPerPage;
  const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
  const currentPackages = sortedPackages.slice(indexOfFirstPackage, indexOfLastPackage);

  const totalPages = Math.ceil(filteredPackages.length / packagesPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredPackages.length, searchText, filterStatus]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
        {/* 🔹 Header & Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Quản lí gói thành viên</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
                <li className="breadcrumb-item active">Quản lí gói</li>
              </ol>
            </nav>
          </div>
          <div>
            <Button type="primary" onClick={handleAddPackage}>Thêm mới</Button>
            <Button type="default" onClick={() => setShowRestoreModal(true)} style={{ marginLeft: 8 }}>Khôi phục</Button>
          </div>
        </div>

        {/* 🔹 Search & Filter */}
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
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>
            <Select
              placeholder="Trạng thái"
              value={filterStatus || undefined}
              onChange={(value) => setFilterStatus(value)}
              style={{ width: 130 }}
              allowClear
            >
              <Select.Option value="ACTIVE">Hoạt động</Select.Option>
              <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
            </Select>
          </div>

          {/* 🔹 Sort */}
          <div className="d-flex align-items-center" style={{ gap: 12 }}>
            <span style={{ marginRight: 8, fontWeight: 500 }}>Sắp xếp:</span>
            <Select
              value={sortField === "createdAt" && sortOrder === "Giảm" ? "Mới nhất" : "Cũ nhất"}
              style={{ width: 120 }}
              onChange={handleSortChange}
              options={[
                { value: "lasted", label: "Mới nhất" },
                { value: "oldest", label: "Cũ nhất" },
              ]}
            />
          </div>
        </div>

        {/* Filter Info */}
        {(searchText || filterStatus) && (
          <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
            <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
            {searchText && (
              <span className="badge bg-primary-transparent">
                <i className="ti ti-search me-1"></i>
                Tìm kiếm: "{searchText}"
              </span>
            )}
            {filterStatus && (
              <span className="badge bg-warning-transparent">
                <i className="ti ti-filter me-1"></i>
                Trạng thái: {filterStatus === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            )}
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setSearchText('');
                setFilterStatus(null);
              }}
            >
              <i className="ti ti-x me-1"></i>
              Xóa tất cả
            </button>
          </div>
        )}

        {/* 🔹 Table */}
        {loading ? (
          <Spin />
        ) : (
          <div className="custom-datatable-filter table-responsive">
            <table className="table datatable">
              <thead className="thead-light">
                <tr>
                  <th>Tên gói</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      <div>
                        <i className="ti ti-package" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                        <p className="mb-0">Không có gói nào</p>
                      </div>
                    </td>
                  </tr>
                ) : currentPackages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      <div>
                        <i className="ti ti-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                        <p className="mb-0">Không tìm thấy gói nào phù hợp</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPackages.map((pkg) => (
                    <tr key={pkg._id || pkg.id}>
                      <td>{pkg.name}</td>
                      <td>{pkg.price}</td>
                      <td>
                        <span className={`badge ${pkg.isActive ? "bg-success-transparent" : "bg-danger-transparent"} text-dark`}>
                          {pkg.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </td>
                      <td>
                        <Button
                          className="management-action-btn"
                          type="primary"
                          onClick={() => handleViewDetail(pkg)}
                          style={{ marginRight: 8 }}
                        >
                          Chi tiết
                        </Button>

                        <Button
                          className="management-action-btn"
                          type="default"
                          icon={<EditOutlined />}
                          onClick={() => handleEditPackage(pkg)}
                          style={{ marginRight: 8 }}
                        >
                          Chỉnh sửa
                        </Button>

                        <Button
                          className="management-action-btn"
                          size="middle"
                          danger
                          onClick={() => handleDeletePackage(pkg)}
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

        {/* Pagination Info and Controls */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex align-items-center gap-3">
            <div className="text-muted">
              Hiển thị {indexOfFirstPackage + 1}-{Math.min(indexOfLastPackage, filteredPackages.length)} trong tổng số {filteredPackages.length} gói
            </div>
          </div>
          {filteredPackages.length > 0 && (
            <nav>
              <ul className="pagination mb-0" style={{ gap: '2px' }}>
                {/* Previous button */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      minWidth: '40px'
                    }}
                  >
                    <i className="ti ti-chevron-left"></i>
                  </button>
                </li>

                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Show all pages if total pages <= 7
                  if (totalPages <= 7) {
                    return (
                      <li key={i} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNumber)}
                          style={{
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            minWidth: '40px',
                            backgroundColor: currentPage === pageNumber ? '#007bff' : 'white',
                            color: currentPage === pageNumber ? 'white' : '#007bff',
                            borderColor: currentPage === pageNumber ? '#007bff' : '#dee2e6'
                          }}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  }

                  // Show first page, last page, current page, and pages around current page
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <li key={i} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNumber)}
                          style={{
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            minWidth: '40px',
                            backgroundColor: currentPage === pageNumber ? '#007bff' : 'white',
                            color: currentPage === pageNumber ? 'white' : '#007bff',
                            borderColor: currentPage === pageNumber ? '#007bff' : '#dee2e6'
                          }}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <li key={i} className="page-item disabled">
                        <span className="page-link" style={{
                          border: '1px solid #dee2e6',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          minWidth: '40px',
                          backgroundColor: '#f8f9fa',
                          color: '#6c757d'
                        }}>...</span>
                      </li>
                    );
                  }
                  return null;
                })}

                {/* Next button */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      minWidth: '40px'
                    }}
                  >
                    <i className="ti ti-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* ✅ Add & Edit Modal */}
      <Modal
        open={showAddModal || showEditModal}
        onCancel={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        footer={null}
        title={showAddModal ? "Thêm gói dịch vụ" : "Cập nhật gói dịch vụ"}
        width={600}
      >
        <Form layout="vertical">
          {/* Tên gói */}
          <Form.Item label="Tên gói" required>
            <Input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên gói"
            />
          </Form.Item>

          <Form.Item label="Loại gói" required>
            <Select
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value })}
              placeholder="Chọn loại gói"
            >
              <Select.Option value="BASIC">BASIC</Select.Option>
              <Select.Option value="STANDARD">STANDARD</Select.Option>
              <Select.Option value="PREMIUM">PREMIUM</Select.Option>
            </Select>
          </Form.Item>

          {/* Giá */}
          <Form.Item label="Giá" required>
            <Input
              name="price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Nhập giá"
            />
          </Form.Item>

          {/* Mô tả */}
          <Form.Item label="Mô tả" required>
            <Input
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả"
            />
          </Form.Item>

          {/* Thời hạn */}
          {showAddModal && (
            <Form.Item label="Thời hạn (ví dụ: 30 ngày)">
              <Input
                name="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Nhập thời hạn"
              />
            </Form.Item>
          )}


          {/* Benefits */}
          <Form.Item label="Quyền lợi">
            {/* Ô nhập + nút thêm quyền lợi */}
            <div style={{ display: "flex", gap: "8px" }}>
              <Input
                placeholder="Nhập quyền lợi"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onPressEnter={() => {
                  if (newBenefit.trim()) {
                    setFormData((prev) => ({
                      ...prev,
                      benefit: [...prev.benefit, newBenefit],
                    }));
                    setNewBenefit("");
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (newBenefit.trim()) {
                    setFormData((prev) => ({
                      ...prev,
                      benefit: [...prev.benefit, newBenefit],
                    }));
                    setNewBenefit("");
                  }
                }}
                type="dashed"
              >
                Thêm
              </Button>
            </div>

            {/* Danh sách quyền lợi đang có */}
            <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
              {formData.benefit?.map((b, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {b}
                  <Button
                    type="link"
                    danger
                    onClick={() => {
                      const updatedBenefits = formData.benefit.filter((_, i) => i !== index);
                      setFormData((prev) => ({
                        ...prev,
                        benefit: updatedBenefits,
                      }));
                    }}
                  >
                    Xóa
                  </Button>
                </li>
              ))}
            </ul>
          </Form.Item>


          {/* Trạng thái */}
          <Form.Item label="Trạng thái">
            <Switch
              checked={formData.isActive}
              onChange={(checked) => setFormData({ ...formData, isActive: checked })}
              checkedChildren="Kích hoạt"
              unCheckedChildren="Khóa"
            />
          </Form.Item>

          {/* Nút hành động */}
          <div className="d-flex justify-content-end">
            <Button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>




      {/* ✅ Delete Modal */}
      <Modal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        footer={null}
        title="Delete Package"
      >
        <div className="modal-body text-center">
          <i className="ti ti-trash-x fs-26 text-danger mb-3 d-inline-block"></i>
          <h4 className="mb-1">Xóa gói</h4>
          <p className="mb-3">Bạn có chắc muốn xóa gói này?</p>
          <div className="d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-light me-3"
              onClick={() => setShowDeleteModal(false)}
            >
              Hủy
            </button>
            <button type="button" className="btn btn-danger" onClick={confirmDelete}>
              Xóa
            </button>
          </div>
        </div>
      </Modal>

      {/* ✅ Restore Modal */}
      <Modal
        open={showRestoreModal}
        onCancel={() => setShowRestoreModal(false)}
        footer={null}
        title="Restore Package"
        width={800}
      >
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>Tên gói</th>
                <th>Giá</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {deletedPackages.map((pkg) => (
                <tr key={pkg._id || pkg.id}>
                  <td>{pkg.name}</td>
                  <td>{pkg.price}</td>
                  <td>{pkg.description}</td>
                  <td>
                    <span className={`badge ${pkg.isActive ? "bg-success" : "bg-danger"}`}>
                      {pkg.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td>
                    <Button size="small" type="primary" onClick={() => handleRestorePackage(pkg._id || pkg.id)}>
                      Restore
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => setShowRestoreModal(false)}
          >
            Đóng
          </button>
        </div>
      </Modal>
      <Modal
        title="Package Details"
        open={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
        ]}
      >
        {selectedPackage && (
          <div>
            <p><strong>Tên gói:</strong> {selectedPackage.name}</p>
            <p><strong>Giá:</strong> ${selectedPackage.price}</p>
            <p><strong>Mô tả:</strong> ${selectedPackage.description}</p>
            <p><strong>Trạng thái:</strong>
              <span className={`badge ${selectedPackage.isActive ? "bg-success-transparent" : "bg-danger-transparent"} text-dark`}>
                {selectedPackage.isActive ? "Hoạt động" : "Không hoạt động"}
              </span>
            </p>
            <p><strong>Tiện ích:</strong></p>
            <ul>
              {selectedPackage.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PackageManagement;