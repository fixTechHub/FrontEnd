// src/pages/admin/WithdrawAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWithdrawLogsThunk,
  approveWithdrawThunk,
  setWithdrawQuery,
} from "../../features/withdraw/withdrawSlice";
import { Button, Select, Popconfirm, message, Spin, Input } from "antd";
import dayjs from "dayjs";

export default function WithdrawAdmin() {
  const dispatch = useDispatch();
  const {
    items = [],
    status,
    approvingId,
    lastQuery,
    page = 1,
    totalPages = 1,
    total,
    limit = 10,
  } = useSelector((s) => s.adminWithdraw);

  // ----- Local UI state (đồng bộ với Certificate/Package) -----
  const [searchText, setSearchText] = useState(lastQuery?.search || "");
  const [filterStatus, setFilterStatus] = useState(lastQuery?.status || "PENDING");

  // kiểm soát “Xem/Ẩn” theo từng dòng
  const [revealMap, setRevealMap] = useState({}); // { [logId]: boolean }

  useEffect(() => {
    dispatch(fetchWithdrawLogsThunk({ page: 1, limit: 10, status: "PENDING" }));
  }, [dispatch]);

  const refetch = (patch = {}) => {
    const q = { ...(lastQuery || {}), ...patch };
    if (!q.search?.trim()) delete q.search;
    if (q.status == null || q.status === "") delete q.status;
    if (!q.limit) q.limit = limit;
    dispatch(setWithdrawQuery(q));
    dispatch(fetchWithdrawLogsThunk(q));
  };

  const handleSearch = () => refetch({ search: searchText, page: 1, status: filterStatus || null });

  const approve = async (logId) => {
    try {
      await dispatch(approveWithdrawThunk(logId)).unwrap();
      message.success("Đã duyệt yêu cầu rút tiền");
      if (lastQuery?.status !== "PENDING") refetch();
    } catch (e) {
      message.error(e || "Duyệt thất bại");
    }
  };

  // Mask text chung: nếu có giá trị -> "••••", nếu rỗng -> "—"
  const maskText = (txt) => (txt ? "••••" : "—");

  // toggle hiện/ẩn + tự ẩn sau 20s
  const toggleReveal = (rowId) => {
    setRevealMap((prev) => {
      const next = { ...prev, [rowId]: !prev[rowId] };
      if (!prev[rowId]) {
        setTimeout(() => {
          setRevealMap((p) => ({ ...p, [rowId]: false }));
        }, 20000);
      }
      return next;
    });
  };

  const isLoading = status === "loading";
  const startIndex = useMemo(() => (page - 1) * (limit || 10), [page, limit]);

  return (
    <div className="modern-page-wrapper">
      <div className="modern-content-card">
        {/* ------ Header & Breadcrumb ------ */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Yêu cầu rút tiền</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
                <li className="breadcrumb-item active">Rút tiền</li>
              </ol>
            </nav>
          </div>
          <div />
        </div>

        {/* ------ Search & Filter bar ------ */}
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
                  placeholder="Tìm theo tên/email kỹ thuật viên"
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
              style={{ width: 180 }}
              allowClear
              options={[
                { label: "Chờ duyệt", value: "PENDING" },
                { label: "Đã duyệt", value: "APPROVED" },
                { label: "Từ chối", value: "REJECTED" },
              ]}
            />

            <Button type="default" onClick={handleSearch}>
              Lọc
            </Button>
          </div>

          <div />
        </div>

        {/* ------ Filter chips ------ */}
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
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setSearchText("");
                setFilterStatus(null);
                refetch({ search: "", status: null, page: 1 });
              }}
            >
              <i className="ti ti-x me-1"></i>
              Xóa tất cả
            </button>
          </div>
        )}

        {/* ------ Table (skin như Certificate) ------ */}
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
                  <th style={{ width: 160 }}>Số tiền</th>
                  <th style={{ width: 180 }}>Ngày tạo</th>
                  <th style={{ width: 160 }}>Trạng thái</th>
                  <th style={{ width: 280 }}>Tài khoản ngân hàng</th>
                  <th style={{ width: 160 }}>Số dư sau duyệt</th>
                  <th style={{ width: 140 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {(!items || items.length === 0) ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      <div>
                        <i
                          className="ti ti-cash-banknote"
                          style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }}
                        />
                        <p className="mb-0">Không có yêu cầu rút tiền</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((record, idx) => {
                    const ba =
                      record?.technician?.bankAccount ||
                      record?.technician?.bankAccounts?.[0] ||
                      null;

                    const bankName = ba?.bankName || ba?.bank || "";
                    const holder = ba?.accountHolder || ba?.holderName || "";
                    const number = ba?.accountNumber || ba?.number || "";

                    const visible = !!revealMap[record._id];

                    return (
                      <tr key={record._id}>
                        <td>{startIndex + idx + 1}</td>
                        <td>
                          <div className="fw-semibold">
                            {record?.technician?.user?.fullName || "—"}
                          </div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {record?.technician?.user?.email || ""}
                          </div>
                        </td>
                        <td>{record.amount != null ? record.amount.toLocaleString("vi-VN") + " ₫" : "—"}</td>
                        <td>{record.createdAt ? dayjs(record.createdAt).format("DD/MM/YYYY HH:mm") : "—"}</td>
                        <td>
                          <span
                            className={`badge text-dark ${
                              record.status === "APPROVED"
                                ? "bg-success-transparent"
                                : record.status === "REJECTED"
                                ? "bg-danger-transparent"
                                : "bg-warning-transparent"
                            }`}
                            style={{ padding: "6px 10px" }}
                          >
                            {record.status === "APPROVED"
                              ? "ĐÃ DUYỆT"
                              : record.status === "REJECTED"
                              ? "TỪ CHỐI"
                              : "CHỜ DUYỆT"}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold">
                            {visible ? (bankName || "—") : maskText(bankName)}
                          </div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {visible ? (holder || "—") : maskText(holder)}
                          </div>
                          <div className="d-flex align-items-center" style={{ gap: 8 }}>
                            <span>{visible ? (number || "—") : maskText(number)}</span>
                            {(bankName || holder || number) && (
                              <Button
                                size="small"
                                type="link"
                                onClick={() => toggleReveal(record._id)}
                                style={{ padding: 0 }}
                              >
                                {visible ? "Ẩn" : "Xem"}
                              </Button>
                            )}
                          </div>
                        </td>
                        <td>
                          {record.balanceAfter != null
                            ? record.balanceAfter.toLocaleString("vi-VN") + " ₫"
                            : "—"}
                        </td>
                        <td>
                          {record.status === "PENDING" ? (
                            <Popconfirm
                              title="Duyệt yêu cầu rút tiền?"
                              okText="Duyệt"
                              cancelText="Hủy"
                              onConfirm={() => approve(record._id)}
                            >
                              <Button
                                type="primary"
                                loading={approvingId === record._id}
                                disabled={approvingId === record._id}
                              >
                                Duyệt
                              </Button>
                            </Popconfirm>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ------ Pagination (giống Certificate) ------ */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Trang {page}/{totalPages} {typeof total === "number" ? `(Tổng ${total})` : ""}
            </div>
            <nav>
              <ul className="pagination mb-0" style={{ gap: "2px" }}>
                {/* Prev */}
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => refetch({ page: page - 1 })}
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
                  if (totalPages <= 7 || p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    const active = p === page;
                    return (
                      <li key={p} className={`page-item ${active ? "active" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => refetch({ page: p })}
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
                    onClick={() => refetch({ page: page + 1 })}
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
    </div>
  );
}