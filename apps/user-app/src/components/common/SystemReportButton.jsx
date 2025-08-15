import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitSystemReportThunk, clearMessages } from '../../features/systemReports/systemReportSlice';
import { toast } from 'react-toastify';

// Inject scoped styles once
const injectStyles = () => {
  if (document.getElementById('sr-style')) return;
  const style = document.createElement('style');
  style.id = 'sr-style';
  style.innerHTML = `
  .sr-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1080;
    animation: srFade .25s ease;
  }
  @keyframes srFade { from { opacity: 0;} to { opacity: 1;} }
  .sr-card {
    width: 92%;
    max-width: 500px;
    background: rgba(255,255,255,0.25);
    border: 1px solid rgba(255,255,255,0.3);
    backdrop-filter: blur(20px) saturate(180%);
    border-radius: 16px;
    color: #fff;
    position: relative;
    animation: srPop .3s ease;
  }
  @keyframes srPop { 0%{ transform: scale(.9); opacity: 0;} 100%{ transform: scale(1); opacity:1;} }
  .sr-card.dark {
    background: rgba(30,30,30,0.8);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .sr-header {
    display:flex;
    align-items:center;
    gap:8px;
    padding:16px 20px;
    border-bottom:1px solid rgba(255,255,255,0.15);
    font-weight:600;
    font-size:18px;
  }
  .sr-body{padding:20px;}
  .sr-footer{padding:16px 20px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid rgba(255,255,255,0.15);} 
  .sr-input, .sr-textarea{
    width:100%;
    padding:12px 14px;
    border-radius:8px;
    border:1px solid rgba(255,255,255,0.4);
    background:rgba(255,255,255,0.2);
    color:#fff;
    margin-bottom:16px;
  }
  .sr-select{
    width:100%;
    padding:12px 14px;
    border-radius:8px;
    border:1px solid rgba(255,255,255,0.4);
    background:rgba(255,255,255,0.85);
    color:#000;
    margin-bottom:16px;
  }
  .sr-card.dark .sr-select{
    background:rgba(60,60,60,0.9);
    color:#fff;
    border:1px solid rgba(255,255,255,0.25);
  }
  .sr-input::placeholder, .sr-textarea::placeholder{color: #e5e5e5;}
  .sr-close{background:none;border:none;color:#fff;font-size:20px;position:absolute;top:12px;right:16px;cursor:pointer;}
  .sr-btn{padding:10px 18px;border:none;border-radius:8px;cursor:pointer;font-weight:600;}
  .sr-btn.primary{background:#ff5722;color:#fff;}
  .sr-btn.secondary{background:rgba(255,255,255,0.25);color:#fff;}
  .sr-char{font-size:12px;opacity:0.8;margin-top:-10px;margin-bottom:12px;display:block;text-align:right;}
  /* dropdown options */
  .sr-select option{background:rgba(255,255,255,0.95);color:#000;}
  .sr-card.dark .sr-select option{background:rgba(40,40,40,0.95);color:#fff;}
  `;
  document.head.appendChild(style);
};

const SystemReportButton = () => {
  injectStyles();

  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.systemReport);

  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: '', tag: 'SYSTEM', description: '' });

  useEffect(() => {
    if (success) {
      toast.success(success);
      closeModal();
    }
  }, [success]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(submitSystemReportThunk(form));
  };

  const closeModal = () => {
    setShow(false);
    setForm({ title: '', tag: 'SYSTEM', description: '' });
    dispatch(clearMessages());
  };

  const isDisabled = loading || !form.title.trim() || form.description.trim().length < 10;

  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <>
      {/* Floating action button */}
      <button
        title="Báo cáo sự cố"
        className="btn btn-danger position-fixed"
        style={{ left: '20px', bottom: '80px', zIndex: 1070, borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 4px 12px rgba(0,0,0,0.3)' }}
        onClick={() => setShow(true)}
      >
        <i className="bi bi-bug-fill" style={{ fontSize: '1.5rem' }}></i>
      </button>

      {show && (
        <div className="sr-overlay" onClick={closeModal}>
          {/* Stop propagation to card */}
          <div className={`sr-card ${isDark ? 'dark' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="sr-close" onClick={closeModal}>&times;</button>
            <div className="sr-header">
              <i className="bi bi-bug-fill"></i>
              Báo cáo sự cố
            </div>
            <form onSubmit={handleSubmit}>
              <div className="sr-body">
                {error && <div className="alert alert-danger py-2">{error}</div>}
                <input
                  type="text"
                  className="sr-input"
                  placeholder="Tiêu đề"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={100}
                />
                <select
                  className="sr-select"
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                >
                  <option value="SYSTEM">Hệ thống</option>
                  <option value="PAYMENT">Thanh toán</option>
                  <option value="UI">Giao diện</option>
                  <option value="OTHER">Khác</option>
                </select>
                <textarea
                  className="sr-textarea"
                  rows={4}
                  placeholder="Mô tả chi tiết (>=10 ký tự)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={500}
                ></textarea>
                <span className="sr-char">{form.description.length}/500</span>
              </div>
              <div className="sr-footer">
                <button type="button" className="sr-btn secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="sr-btn primary d-flex align-items-center gap-2" disabled={isDisabled}>
                  {loading && <span className="spinner-border spinner-border-sm"></span>}
                  Gửi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </>
  );
};

export default SystemReportButton;
