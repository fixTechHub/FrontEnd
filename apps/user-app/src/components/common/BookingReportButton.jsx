import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReportThunk, clearError, clearSuccess } from '../../features/reports/reportSlice';
import { toast } from 'react-toastify';

const ALL_TAGS = [
  { value: 'NO_SHOW', label: 'Không đến' },
  { value: 'LATE', label: 'Đến muộn' },
  { value: 'RUDE', label: 'Thái độ không tốt' },
  { value: 'ISSUE', label: 'Có vấn đề phát sinh' },
  { value: 'WARRANTY_DENIED', label: 'Từ chối bảo hành' },
  { value: 'WARRANTY_DELAY', label: 'Trì hoãn bảo hành' },
  { value: 'POOR_FIX', label: 'Sửa không đạt' },
  { value: 'OTHER', label: 'Khác' },
];

const injectStyleOnce = () => {
  if (document.getElementById('br-style')) return;
  const style = document.createElement('style');
  style.id = 'br-style';
  style.innerHTML = `
  .br-overlay {position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);z-index:1080;backdrop-filter:blur(6px);} 
  .br-card {width:92%;max-width:500px;background:rgba(255,255,255,0.25);border:1px solid rgba(255,255,255,0.3);backdrop-filter:blur(20px) saturate(180%);border-radius:16px;animation:brPop .25s ease;color:#fff;} 
  .br-card.dark{background:rgba(30,30,30,0.8);border:1px solid rgba(255,255,255,0.1);} 
  @keyframes brPop {0%{transform:scale(.9);opacity:0;}100%{transform:scale(1);opacity:1;}}
  .br-header{padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.15);font-weight:600;display:flex;justify-content:space-between;align-items:center;}
  .br-body{padding:20px;}
  .br-footer{padding:16px 20px;border-top:1px solid rgba(255,255,255,0.15);display:flex;justify-content:flex-end;gap:10px;}
  .br-input,.br-text{width:100%;padding:12px 14px;margin-bottom:16px;border-radius:8px;border:1px solid rgba(255,255,255,0.4);background:rgba(255,255,255,0.2);color:#fff;}
  .br-select{width:100%;padding:12px 14px;margin-bottom:16px;border-radius:8px;border:1px solid rgba(255,255,255,0.4);background:rgba(255,255,255,0.85);color:#000;appearance:auto;}
  .br-card.dark .br-input,.br-card.dark .br-text{background:rgba(60,60,60,0.6);border:1px solid rgba(255,255,255,0.3);} 
  .br-card.dark .br-select{background:rgba(60,60,60,0.9);color:#fff;border:1px solid rgba(255,255,255,0.25);} 
  .br-select option{background:rgba(255,255,255,0.95);color:#000;} 
  .br-card.dark .br-select option{background:rgba(40,40,40,0.95);color:#fff;} 
  .br-close{background:none;border:none;font-size:20px;color:#fff;cursor:pointer;} 
  `;
  document.head.appendChild(style);
};

const BookingReportButton = ({ bookingId, reportedUserId, warrantyId }) => {
  injectStyleOnce();
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((s) => s.report);

  const [open, setOpen] = useState(false);

  const isWarranty = Boolean(warrantyId);
  const TAGS = ALL_TAGS.filter(t => isWarranty || !['WARRANTY_DENIED','WARRANTY_DELAY','POOR_FIX'].includes(t.value));

  const [form, setForm] = useState({ title: '', tag: TAGS[0].value, description: '' });

  useEffect(() => {
    if (success) {
      toast.success(success);
      close();
    }
  }, [success]);

  const close = () => {
    setOpen(false);
    setForm({ title: '', tag: TAGS[0].value, description: '' });
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      bookingId,
      warrantyId,
      reportedUserId,
      title: form.title,
      tag: form.tag,
      description: form.description,
      evidences: [],
    };
    dispatch(createReportThunk(payload));
  };

  const disabled = loading || !form.title.trim() || form.description.trim().length < 10;

  return (
    <>
      <button
        type="button"
        className="btn p-0 bg-transparent border-0"
        style={{ lineHeight: 0 }}
        title="Báo cáo đơn hàng"
        onClick={() => setOpen(true)}
      >
        <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '1.6rem' }}></i>
      </button>

      {open && (
        <div className="br-overlay" onClick={close}>
          <div className={`br-card ${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="br-header">
              <span>Báo cáo đơn hàng</span>
              <button className="br-close" onClick={close}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="br-body">
                {error && <div className="alert alert-danger py-2">{error}</div>}
                <input
                  className="br-input"
                  placeholder="Tiêu đề"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={100}
                />
                <select
                  className="br-select"
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                >
                  {TAGS.map((tag) => (
                    <option key={tag.value} value={tag.value}>{tag.label}</option>
                  ))}
                </select>
                <textarea
                  className="br-text"
                  rows={4}
                  placeholder="Mô tả chi tiết (>=10 ký tự)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={500}
                ></textarea>
                <small className="text-muted">{form.description.length}/500</small>
              </div>
              <div className="br-footer">
                <button type="button" className="btn btn-secondary" onClick={close}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={disabled}>
                  {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingReportButton;
