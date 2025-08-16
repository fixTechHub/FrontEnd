import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllCertificatesThunk,
    verifyCertificateThunk,
    setCertQuery,
} from '../../features/certificates/certificateSlice';
import { Button, Select, Spin, Modal, Input, message  } from 'antd';

export default function CertificateAdmin() {
    const dispatch = useDispatch();
    const { certificates, status, verifyingId, lastQuery, totalPages, page } =
        useSelector((s) => s.adminCertificate);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);

    // modal từ chối
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectId, setRejectId] = useState(null);
    const [reason, setReason] = useState('');

    useEffect(() => {
        dispatch(fetchAllCertificatesThunk({ page: 1, limit: 10 }));
    }, [dispatch]);

    const refetch = (patch = {}) => {
        const query = { ...lastQuery, ...patch };
        dispatch(setCertQuery(query));
        dispatch(fetchAllCertificatesThunk(query));
    };

    const approve = async (id) => {
        try {
            await dispatch(verifyCertificateThunk({ id, status: 'APPROVED' })).unwrap();
            message.success('Đã duyệt chứng chỉ');
            refetch(); // nếu đang lọc theo PENDING thì refetch để biến mất khỏi list
        } catch (e) {
            message.error(e || 'Duyệt thất bại');
        }
    };

    const openReject = (id) => {
        setRejectId(id);
        setReason('');
        setRejectOpen(true);
    };
    const confirmReject = () => {
        if (!reason.trim()) return;
        dispatch(verifyCertificateThunk({ id: rejectId, status: 'REJECTED', reason: reason.trim() }))
            .then(() => {
                setRejectOpen(false);
                refetch();
            });
    };

    if (status === 'loading') return <Spin />;

    return (
        <div>
            {/* Search & Filter */}
            <div className="d-flex gap-2 mb-3">
                <input
                    className="form-control"
                    placeholder="Tìm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && refetch({ search, page: 1 })}
                    style={{ maxWidth: 280 }}
                />
                <Select
                    placeholder="Trạng thái"
                    value={statusFilter || undefined}
                    onChange={(v) => { setStatusFilter(v || null); refetch({ status: v || null, page: 1 }); }}
                    allowClear
                    style={{ width: 160 }}
                >
                    <Select.Option value="PENDING">Chờ duyệt</Select.Option>
                    <Select.Option value="APPROVED">Đã duyệt</Select.Option>
                    <Select.Option value="REJECTED">Từ chối</Select.Option>
                </Select>
                <Button onClick={() => refetch({ search, page: 1 })}>Lọc</Button>
            </div>

            {/* BẢNG HIỂN THỊ */}
            <div className="table-responsive">
                <table className="table table-bordered align-middle">
                    <thead className="thead-light">
                        <tr>
                            <th style={{ width: 60 }}>#</th>
                            <th>Kỹ thuật viên</th>
                            <th>Chứng chỉ</th>
                            <th style={{ width: 140 }}>Ngày tạo</th>
                            <th style={{ width: 140 }}>Trạng thái</th>
                            <th style={{ width: 220 }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(!certificates || certificates.length === 0) ? (
                            <tr>
                                <td colSpan={6} className="text-center text-muted">Không có chứng chỉ</td>
                            </tr>
                        ) : certificates.map((item, idx) => (
                            <tr key={item._id}>
                                <td>{(page - 1) * (lastQuery?.limit || 10) + idx + 1}</td>
                                <td>
                                    <div className="fw-semibold">
                                        {item?.technicianId?.userId?.fullName || '—'}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: 12 }}>
                                        {item?.technicianId?.userId?.email || ''}
                                    </div>
                                </td>
                                <td className="blog-img">
                                    {item.fileUrl ? (
                                        item.fileUrl.toLowerCase().endsWith('.pdf') ? (
                                            <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-muted fst-italic">
                                                Xem file PDF
                                            </a>
                                        ) : (
                                            <a href={item.fileUrl} target="_blank" rel="noreferrer" title="Xem ảnh">
                                                <img
                                                    src={item.fileUrl}
                                                    alt="certificate"
                                                    style={{ width: 80, height: 'auto', borderRadius: 6, border: '1px solid #e5e7eb' }}
                                                />
                                            </a>
                                        )
                                    ) : '—'}
                                </td>
                                <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                                <td>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontWeight: '500',
                                            color: '#fff',
                                            backgroundColor:
                                                item.status === 'APPROVED'
                                                    ? '#28a745' // xanh lá
                                                    : item.status === 'REJECTED'
                                                        ? '#dc3545' // đỏ
                                                        : '#ffc107', // vàng
                                        }}
                                    >
                                        {item.status === 'APPROVED'
                                            ? 'Đã duyệt'
                                            : item.status === 'REJECTED'
                                                ? 'Từ chối'
                                                : 'Chờ duyệt'}
                                    </span>
                                </td>
                                <td>
                                    {item.status === 'PENDING' && (
                                        <>
                                            <Button
                                                style={{
                                                    backgroundColor: '#007bff',
                                                    color: '#fff',
                                                    marginRight: '8px',
                                                    border: 'none',
                                                }}
                                                onClick={() => approve(item._id)}
                                            >
                                                Duyệt
                                            </Button>
                                            <Button
                                                style={{
                                                    backgroundColor: '#fff',
                                                    color: '#dc3545',
                                                    border: '1px solid #dc3545',
                                                }}
                                                onClick={() => openReject(item._id, 'Lý do từ chối')}
                                            >
                                                Từ chối
                                            </Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* (tuỳ chọn) phân trang cơ bản */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-end gap-2">
                    <Button disabled={page <= 1} onClick={() => refetch({ page: page - 1 })}>Trước</Button>
                    <div className="align-self-center">Trang {page}/{totalPages}</div>
                    <Button disabled={page >= totalPages} onClick={() => refetch({ page: page + 1 })}>Sau</Button>
                </div>
            )}

            {/* MODAL TỪ CHỐI */}
            <Modal
                title="Nhập lý do từ chối"
                open={rejectOpen}
                onCancel={() => setRejectOpen(false)}
                onOk={confirmReject}
                okText="Xác nhận"
                cancelText="Hủy"
                maskClosable={false}
                destroyOnClose
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
    );
}
