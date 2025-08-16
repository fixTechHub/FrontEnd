// src/pages/admin/WithdrawAdmin.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWithdrawLogsThunk,
  approveWithdrawThunk,
  setWithdrawQuery,
} from '../../features/withdraw/withdrawSlice';
import {
  Table,
  Button,
  Tag,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Pagination,
} from 'antd';
import dayjs from 'dayjs';

export default function WithdrawAdmin() {
  const dispatch = useDispatch();
  const { items, status, approvingId, lastQuery, page, totalPages, total, limit } =
    useSelector((s) => s.adminWithdraw);

  const [search, setSearch] = useState(lastQuery?.search || '');
  const [statusFilter, setStatusFilter] = useState(lastQuery?.status || 'PENDING');

  // kiểm soát “Xem/Ẩn” theo từng dòng
  const [revealMap, setRevealMap] = useState({}); // { [logId]: boolean }

  useEffect(() => {
    dispatch(fetchWithdrawLogsThunk({ page: 1, limit: 10, status: 'PENDING' }));
  }, [dispatch]);

  const refetch = (patch = {}) => {
    const q = { ...lastQuery, ...patch };
    if (!q.search?.trim()) delete q.search;
    if (q.status == null || q.status === '') delete q.status;
    dispatch(setWithdrawQuery(q));
    dispatch(fetchWithdrawLogsThunk(q));
  };

  const approve = async (logId) => {
    try {
      await dispatch(approveWithdrawThunk(logId)).unwrap();
      message.success('Đã duyệt yêu cầu rút tiền');
      if (lastQuery?.status !== 'PENDING') refetch();
    } catch (e) {
      message.error(e || 'Duyệt thất bại');
    }
  };

  // Mask text chung: nếu có giá trị -> "••••", nếu rỗng -> "—"
  const maskText = (txt) => (txt ? '••••' : '—');

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

  const columns = [
    {
      title: '#',
      dataIndex: '_idx',
      width: 60,
      render: (_v, _r, idx) => (page - 1) * (limit || 10) + idx + 1,
    },
    {
      title: 'Kỹ thuật viên',
      dataIndex: 'technician',
      render: (_v, record) => (
        <div>
          <div className="fw-semibold">{record?.technician?.user?.fullName || '—'}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {record?.technician?.user?.email || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      width: 140,
      render: (v) => (v != null ? v.toLocaleString('vi-VN') + ' ₫' : '—'),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 160,
      render: (v) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (st) =>
        st === 'APPROVED' ? (
          <Tag color="green">Đã duyệt</Tag>
        ) : st === 'REJECTED' ? (
          <Tag color="red">Từ chối</Tag>
        ) : (
          <Tag color="gold">Chờ duyệt</Tag>
        ),
    },
    {
      title: 'Tài khoản ngân hàng',
      dataIndex: 'bank',
      width: 260,
      render: (_v, record) => {
        const ba =
          record?.technician?.bankAccount ||
          record?.technician?.bankAccounts?.[0] ||
          null;

        const bankName = ba?.bankName || ba?.bank || '';
        const holder = ba?.accountHolder || ba?.holderName || '';
        const number = ba?.accountNumber || ba?.number || '';

        const visible = !!revealMap[record._id];

        return (
          <div>
            <div className="fw-semibold">
              {visible ? (bankName || '—') : maskText(bankName)}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {visible ? (holder || '—') : maskText(holder)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{visible ? (number || '—') : maskText(number)}</span>
              {(bankName || holder || number) && (
                <Button
                  size="small"
                  type="link"
                  onClick={() => toggleReveal(record._id)}
                  style={{ padding: 0 }}
                >
                  {visible ? 'Ẩn' : 'Xem'}
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số dư sau duyệt',
      dataIndex: 'balanceAfter',
      width: 160,
      render: (v) => (v != null ? v.toLocaleString('vi-VN') + ' ₫' : '—'),
    },
    {
      title: 'Hành động',
      dataIndex: 'actions',
      width: 160,
      render: (_v, record) =>
        record.status === 'PENDING' ? (
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
          <span style={{ color: '#6b7280' }}>—</span>
        ),
    },
  ];

  return (
    <div>
      {/* Bộ lọc */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Tìm theo tên/email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={() => refetch({ search, page: 1 })}
          style={{ width: 280 }}
          allowClear
        />
        <Select
          value={statusFilter || undefined}
          placeholder="Trạng thái"
          onChange={(v) => {
            setStatusFilter(v || null);
            refetch({ status: v || null, page: 1 });
          }}
          allowClear
          style={{ width: 180 }}
          options={[
            { label: 'Chờ duyệt', value: 'PENDING' },
            { label: 'Đã duyệt', value: 'APPROVED' },
            { label: 'Từ chối', value: 'REJECTED' },
          ]}
        />
        <Button onClick={() => refetch({ search, status: statusFilter || null, page: 1 })}>
          Lọc
        </Button>
      </Space>

      <Table
        rowKey="_id"
        loading={status === 'loading'}
        dataSource={items}
        columns={columns}
        pagination={false}
        bordered
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Pagination
          current={page}
          total={total}
          pageSize={limit}
          onChange={(p, ps) => refetch({ page: p, limit: ps })}
          showSizeChanger
          showTotal={(t) => `Tổng ${t} yêu cầu`}
        />
      </div>
    </div>
  );
}
