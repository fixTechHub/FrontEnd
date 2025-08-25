import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllCertificatesThunk,
    verifyCertificateThunk,
    setCertQuery,
} from "../../features/certificates/certificateSlice";
import { Button, Modal, Input, Select, Spin, message } from "antd";

const { Option } = Select;

export default function CertificateAdmin() {
    const dispatch = useDispatch();
    const {
        certificates,
        status,
        verifyingId,
        lastQuery,
        totalPages = 1,
        page = 1,
    } = useSelector((s) => s.adminCertificate);

    // ----- Local UI state (đồng bộ với PackageManagement) -----
    const [searchText, setSearchText] = useState(lastQuery?.search || "");
    const [filterStatus, setFilterStatus] = useState(lastQuery?.status || null);

    // Modal từ chối
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectId, setRejectId] = useState(null);
    const [reason, setReason] = useState("");
    // Preview modal cho ảnh/PDF
    const [preview, setPreview] = useState({ open: false, url: "", type: "image" });
    const openPreview = (url) => {
        if (!url) return;
        const isPdf = url.toLowerCase().endsWith(".pdf");
        setPreview({ open: true, url, type: isPdf ? "pdf" : "image" });
    };


    const limit = lastQuery?.limit || 10;

    useEffect(() => {
        dispatch(fetchAllCertificatesThunk({ page: 1, limit }));
    }, [dispatch]); // limit đã có trong lastQuery lần đầu

    // Cleanup filters when component unmounts
    useEffect(() => {
        return () => {
            // Reset local states when leaving the page
            setSearchText("");
            setFilterStatus(null);
        };
    }, []);

    // Giữ nguyên query cũ + patch
    const refetch = (patch = {}) => {
        const query = { ...(lastQuery || {}), limit, ...patch };
        dispatch(setCertQuery(query));
        dispatch(fetchAllCertificatesThunk(query));
    };

    const handleSearch = () => refetch({ search: searchText, page: 1, status: filterStatus || null });

    const handleApprove = async (id) => {
        try {
            await dispatch(verifyCertificateThunk({ id, status: "APPROVED" })).unwrap();
            message.success("Đã duyệt chứng chỉ");
            refetch();
        } catch (e) {
            message.error(e || "Duyệt thất bại");
        }
    };

    const openReject = (id) => {
        setRejectId(id);
        setReason("");
        setRejectOpen(true);
    };

    const confirmReject = async () => {
        if (!reason.trim()) return;
        try {
            await dispatch(
                verifyCertificateThunk({ id: rejectId, status: "REJECTED", reason: reason.trim() })
            ).unwrap();
            setRejectOpen(false);
            message.success("Đã từ chối chứng chỉ");
            refetch();
        } catch (e) {
            message.error(e || "Từ chối thất bại");
        }
    };

    const handleClearFilters = () => {
        setSearchText("");
        setFilterStatus(null);
        refetch({ search: "", status: null, page: 1 });
    };

    const handlePageChange = (p) => refetch({ page: p });

    const isLoading = status === "loading";

    // Tính index hiển thị # thứ tự như cũ
    const startIndex = useMemo(() => (page - 1) * limit, [page, limit]);

    return (
        <>
        <div className="modern-page- wrapper">
            <div className="modern-content-card">
                {/* ------ Header & Breadcrumb (giống package) ------ */}
                <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                    <div className="my-auto mb-2">
                        <h4 className="mb-1">Quản lí chứng chỉ</h4>
                        <nav>
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
                                <li className="breadcrumb-item active">Chứng chỉ</li>
                            </ol>
                        </nav>
                    </div>
                    {/* (Không có nút thêm mới cho chứng chỉ admin nên để trống để đồng bộ layout) */}
                    <div />
                </div>

                {/* ------ Search & Filter bar (giống package) ------ */}
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
                                    placeholder="Tìm kiếm theo tên/email kỹ thuật viên"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                        </div>

                        <Select
                            placeholder="Trạng thái"
                            value={filterStatus || undefined}
                            onChange={(v) => {
                                setFilterStatus(v || null);
                                refetch({ status: v || null, page: 1, search: searchText });
                            }}
                            style={{ width: 160 }}
                            allowClear
                        >
                            <Option value="PENDING">Chờ duyệt</Option>
                            <Option value="APPROVED">Đã duyệt</Option>
                            <Option value="REJECTED">Từ chối</Option>
                        </Select>

                        <Button type="default" onClick={handleSearch}>
                            Lọc
                        </Button>
                    </div>

                    {/* Slot “Sort” bên phải  bỏ qua để không thay đổi backend */}
                    <div />
                </div>

                {/* ------ Filter info chips (giống package) ------ */}
                {(searchText || filterStatus) && (
                    <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
                        <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
                        {searchText && (
                            <span className="badge bg-primary-transparent">
                                <i className="ti ti-search me-1"></i>
                                Từ khóa: "{searchText}"
                            </span>
                        )}
                        {filterStatus && (
                            <span className="badge bg-warning-transparent">
                                <i className="ti ti-filter me-1"></i>
                                Trạng thái:{" "}
                                {filterStatus === "APPROVED"
                                    ? "Đã duyệt"
                                    : filterStatus === "REJECTED"
                                        ? "Từ chối"
                                        : "Chờ duyệt"}
                            </span>
                        )}
                        <button className="btn btn-sm btn-outline-secondary" onClick={handleClearFilters}>
                            <i className="ti ti-x me-1"></i>
                            Xóa tất cả
                        </button>
                    </div>
                )}

                {/* ------ Table (giữ dữ liệu cũ, skin như package) ------ */}
                {isLoading ? (
                    <div className="text-center py-5">
                        <Spin />
                    </div>
                ) : (
                    <div className="custom-datatable-filter table-responsive">
                        <table className="table datatable align-middle">
                            <thead className="thead-light">
                                <tr>
                                    <th style={{ width: 60 }}>#</th>
                                    <th>Kỹ thuật viên</th>
                                    <th>Chứng chỉ</th>
                                    <th style={{ width: 160 }}>Ngày tạo</th>
                                    <th style={{ width: 160 }}>Trạng thái</th>
                                    <th style={{ width: 240 }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!certificates || certificates.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">
                                            <div>
                                                <i
                                                    className="ti ti-certificate"
                                                    style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }}
                                                />
                                                <p className="mb-0">Không có chứng chỉ</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    certificates.map((item, idx) => (
                                        <tr key={item._id}>
                                            <td>{startIndex + idx + 1}</td>
                                            <td>
                                                <div className="fw-semibold">
                                                    {item?.technicianId?.userId?.fullName || ""}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: 12 }}>
                                                    {item?.technicianId?.userId?.email || ""}
                                                </div>
                                            </td>
                                            <td className="blog-img">
                                                {item.fileUrl ? (
                                                    item.fileUrl.toLowerCase().endsWith(".pdf") ? (
                                                        <Button
                                                            type="link"
                                                            className="p-0"
                                                            onClick={() => openPreview(item.fileUrl)}
                                                        >
                                                            Xem file PDF
                                                        </Button>
                                                    ) : (
                                                        <img
                                                            src={item.fileUrl}
                                                            alt="certificate"
                                                            onClick={() => openPreview(item.fileUrl)}
                                                            style={{
                                                                width: 80,
                                                                height: "auto",
                                                                borderRadius: 6,
                                                                border: "1px solid #e5e7eb",
                                                                cursor: "zoom-in",
                                                            }}
                                                        />
                                                    )
                                                ) : ""}
                                            </td>

                                            <td>
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                                                    : ""}
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge text-dark ${item.status === "APPROVED"
                                                        ? "bg-success-transparent"
                                                        : item.status === "REJECTED"
                                                            ? "bg-danger-transparent"
                                                            : "bg-warning-transparent"
                                                        }`}
                                                    style={{ padding: "6px 10px" }}
                                                >
                                                    {item.status === "APPROVED"
                                                        ? "ĐÃ DUYỆT"
                                                        : item.status === "REJECTED"
                                                            ? "TỪ CHỐI"
                                                            : "CHỜ DUYỆT"}
                                                </span>
                                            </td>
                                            <td>
                                                {item.status === "PENDING" ? (
                                                    <>
                                                        <Button
                                                            className="management-action-btn"
                                                            type="primary"
                                                            onClick={() => handleApprove(item._id)}
                                                            loading={verifyingId === item._id}
                                                            style={{ marginRight: 8 }}
                                                        >
                                                            Duyệt
                                                        </Button>
                                                        <Button
                                                            className="management-action-btn"
                                                            type="default"
                                                            danger
                                                            onClick={() => openReject(item._id)}
                                                            disabled={verifyingId === item._id}
                                                        >
                                                            Từ chối
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className="text-muted"></span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ------ Pagination (giống package, dùng server totalPages) ------ */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted">
                            Trang {page}/{totalPages}
                        </div>
                        <nav>
                            <ul className="pagination mb-0" style={{ gap: "2px" }}>
                                {/* Prev */}
                                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        style={{
                                            border: "1px solid #dee2e6",
                                            borderRadius: "6px",
                                            padding: "8px 12px",
                                            minWidth: "40px",
                                        }}
                                    >
                                        <i className="ti ti-chevron-left"></i>
                                    </button>
                                </li>

                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                    // Hiển thị đầy đủ nếu <=7, hoặc hiển thị đầu/cuối/xung quanh trang hiện tại
                                    if (
                                        totalPages <= 7 ||
                                        p === 1 ||
                                        p === totalPages ||
                                        (p >= page - 1 && p <= page + 1)
                                    ) {
                                        const active = p === page;
                                        return (
                                            <li key={p} className={`page-item ${active ? "active" : ""}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(p)}
                                                    style={{
                                                        border: "1px solid #dee2e6",
                                                        borderRadius: "6px",
                                                        padding: "8px 12px",
                                                        minWidth: "40px",
                                                        backgroundColor: active ? "#007bff" : "white",
                                                        color: active ? "white" : "#007bff",
                                                        borderColor: active ? "#007bff" : "#dee2e6",
                                                    }}
                                                >
                                                    {p}
                                                </button>
                                            </li>
                                        );
                                    }
                                    if (p === page - 2 || p === page + 2) {
                                        return (
                                            <li key={p} className="page-item disabled">
                                                <span
                                                    className="page-link"
                                                    style={{
                                                        border: "1px solid #dee2e6",
                                                        borderRadius: "6px",
                                                        padding: "8px 12px",
                                                        minWidth: "40px",
                                                        backgroundColor: "#f8f9fa",
                                                        color: "#6c757d",
                                                    }}
                                                >
                                                    …
                                                </span>
                                            </li>
                                        );
                                    }
                                    return null;
                                })}

                                {/* Next */}
                                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages}
                                        style={{
                                            border: "1px solid #dee2e6",
                                            borderRadius: "6px",
                                            padding: "8px 12px",
                                            minWidth: "40px",
                                        }}
                                    >
                                        <i className="ti ti-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* ------ Modal Từ chối (đồng bộ style) ------ */}
            <Modal
                title="Nhập lý do từ chối"
                open={rejectOpen}
                onCancel={() => setRejectOpen(false)}
                onOk={confirmReject}
                okText="Xác nhận"
                cancelText="Hủy"
                maskClosable={false}
                destroyOnHidden //ĐỔI SANG CÁI NI
            >
                <Input.TextArea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do..."
                    autoSize={{ minRows: 4, maxRows: 6 }}
                    maxLength={300}
                    showCount
                />
            </Modal>
        </div>
        <Modal
  open={preview.open}
  onCancel={() => setPreview({ open: false, url: "", type: "image" })}
  footer={null}
  destroyOnClose
  width={preview.type === "pdf" ? 1000 : 900}
  bodyStyle={{ padding: 0 }}
  title={preview.type === "pdf" ? "Xem PDF" : "Xem ảnh"}
>
  {preview.type === "pdf" ? (
    // Lưu ý: một số link có thể chặn nhúng qua header (X-Frame-Options/CORS)
    <iframe
      src={preview.url}
      title="certificate-pdf"
      style={{ width: "100%", height: "80vh", border: 0 }}
    />
  ) : (
    <img
      src={preview.url}
      alt="certificate"
      style={{ width: "100%", display: "block", borderRadius: "0 0 8px 8px" }}
    />
  )}
</Modal>
</>
    );
}
