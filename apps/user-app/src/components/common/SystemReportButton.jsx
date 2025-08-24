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
  
  /* Enhanced floating button styles */
  .report-btn-floating {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    border: none;
    position: relative;
    overflow: hidden;
  }
  
  .report-btn-floating::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  .report-btn-floating:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 20px rgba(220, 53, 69, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15);
    background: linear-gradient(135deg, #e74c3c 0%, #dc3545 100%);
  }
  
  .report-btn-floating:hover::before {
    left: 100%;
  }
  
  .report-btn-floating:active {
    transform: translateY(0) scale(0.98);
    transition: all 0.1s ease;
  }
  
  .report-btn-icon {
    transition: all 0.3s ease;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
  
  .report-btn-floating:hover .report-btn-icon {
    transform: rotate(-10deg) scale(1.1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  @keyframes reportPulse {
    0%, 100% { 
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1), 0 0 0 0 rgba(220, 53, 69, 0.7);
    }
    50% { 
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1), 0 0 0 10px rgba(220, 53, 69, 0);
    }
  }
  
  .report-btn-floating.pulse {
    animation: reportPulse 2s infinite;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .report-btn-floating {
      width: 50px !important;
      height: 50px !important;
      bottom: 16px !important;
      left: 16px !important;
    }
    
    .report-btn-icon {
      font-size: 1.3rem !important;
    }
  }
  
  @media (max-width: 480px) {
    .report-btn-floating {
      width: 46px !important;
      height: 46px !important;
      bottom: 12px !important;
      left: 12px !important;
    }
    
    .report-btn-icon {
      font-size: 1.2rem !important;
    }
  }
  
  /* Entrance animation */
  @keyframes reportSlideIn {
    0% {
      transform: translateX(-100px) scale(0.8);
      opacity: 0;
    }
    50% {
      transform: translateX(10px) scale(1.1);
      opacity: 0.8;
    }
    100% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }
  
  .report-btn-entrance {
    animation: reportSlideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .sr-card {
    width: 92%;
    max-width: 520px;
    background: linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    border: 1px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(30px) saturate(200%);
    border-radius: 24px;
    color: #fff;
    position: relative;
    animation: srPop .4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 
      0 20px 40px rgba(0,0,0,0.1),
      0 8px 16px rgba(0,0,0,0.1),
      inset 0 1px 0 rgba(255,255,255,0.2);
    overflow: hidden;
  }
  
  .sr-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  }
  
  @keyframes srPop { 
    0%{ 
      transform: scale(.85) translateY(30px); 
      opacity: 0;
    } 
    60%{
      transform: scale(1.02) translateY(-5px);
      opacity: 0.9;
    }
    100%{ 
      transform: scale(1) translateY(0); 
      opacity:1;
    } 
  }
  
  .sr-card.dark {
    background: linear-gradient(145deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 
      0 20px 40px rgba(0,0,0,0.3),
      0 8px 16px rgba(0,0,0,0.2),
      inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .sr-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 28px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    font-weight: 700;
    font-size: 20px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
    position: relative;
  }
  
  .sr-header i {
    font-size: 24px;
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
  
  .sr-body {
    padding: 28px;
    position: relative;
  }
  
  .sr-footer {
    padding: 20px 28px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid rgba(255,255,255,0.1);
    background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.05));
  } 
  .sr-input, .sr-textarea {
    width: 100%;
    padding: 16px 18px;
    border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.1);
    color: #fff;
    margin-bottom: 20px;
    font-size: 15px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    box-shadow: 
      0 4px 6px rgba(0,0,0,0.05),
      inset 0 1px 0 rgba(255,255,255,0.1);
  }
  
  .sr-input:focus, .sr-textarea:focus {
    outline: none;
    border-color: rgba(255,107,107,0.6);
    background: rgba(255,255,255,0.15);
    box-shadow: 
      0 8px 16px rgba(0,0,0,0.1),
      0 0 0 3px rgba(255,107,107,0.1),
      inset 0 1px 0 rgba(255,255,255,0.2);
    transform: translateY(-1px);
  }
  
  .sr-select {
    width: 100%;
    padding: 16px 18px;
    border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.9);
    color: #333;
    margin-bottom: 20px;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    box-shadow: 
      0 4px 6px rgba(0,0,0,0.05),
      inset 0 1px 0 rgba(255,255,255,0.3);
    cursor: pointer;
  }
  
  .sr-select:focus {
    outline: none;
    border-color: rgba(255,107,107,0.6);
    box-shadow: 
      0 8px 16px rgba(0,0,0,0.1),
      0 0 0 3px rgba(255,107,107,0.1),
      inset 0 1px 0 rgba(255,255,255,0.4);
    transform: translateY(-1px);
  }
  
  .sr-card.dark .sr-select {
    background: rgba(40,40,40,0.9);
    color: #fff;
    border: 1.5px solid rgba(255,255,255,0.2);
    box-shadow: 
      0 4px 6px rgba(0,0,0,0.2),
      inset 0 1px 0 rgba(255,255,255,0.1);
  }
  
  .sr-card.dark .sr-select:focus {
    background: rgba(50,50,50,0.95);
    box-shadow: 
      0 8px 16px rgba(0,0,0,0.3),
      0 0 0 3px rgba(255,107,107,0.1),
      inset 0 1px 0 rgba(255,255,255,0.2);
  }
  
  .sr-input::placeholder, .sr-textarea::placeholder {
    color: rgba(255,255,255,0.6);
    font-weight: 400;
  }
  .sr-close {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    position: absolute;
    top: 16px;
    right: 16px;
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(15px);
    z-index: 10;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  
  .sr-close:hover {
    background: rgba(255,107,107,0.25);
    border-color: rgba(255,107,107,0.5);
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(255,107,107,0.2);
  }
  
  .sr-close:active {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }
  
  .sr-btn {
    padding: 14px 24px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    min-width: 80px;
    backdrop-filter: blur(10px);
  }
  
  .sr-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  .sr-btn:hover::before {
    left: 100%;
  }
  
  .sr-btn.primary {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    color: #fff;
    box-shadow: 
      0 4px 12px rgba(255,107,107,0.3),
      0 2px 6px rgba(0,0,0,0.1);
  }
  
  .sr-btn.primary:hover {
    background: linear-gradient(135deg, #ff5252 0%, #e53e3e 100%);
    box-shadow: 
      0 8px 20px rgba(255,107,107,0.4),
      0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }
  
  .sr-btn.primary:active {
    transform: translateY(0);
    transition: all 0.1s ease;
  }
  
  .sr-btn.primary:disabled {
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.5);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .sr-btn.secondary {
    background: rgba(255,255,255,0.1);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 
      0 4px 6px rgba(0,0,0,0.05),
      inset 0 1px 0 rgba(255,255,255,0.1);
  }
  
  .sr-btn.secondary:hover {
    background: rgba(255,255,255,0.15);
    border-color: rgba(255,255,255,0.3);
    box-shadow: 
      0 8px 16px rgba(0,0,0,0.1),
      inset 0 1px 0 rgba(255,255,255,0.2);
    transform: translateY(-1px);
  }
  
  .sr-char {
    font-size: 13px;
    opacity: 0.7;
    margin-top: -12px;
    margin-bottom: 16px;
    display: block;
    text-align: right;
    font-weight: 400;
  }
  /* Dropdown options styling */
  .sr-select option {
    background: rgba(255,255,255,0.95);
    color: #333;
    padding: 12px 16px;
    font-weight: 500;
    border-radius: 8px;
    margin: 2px 0;
  }
  
  .sr-select option:hover {
    background: rgba(255,107,107,0.1);
  }
  
  .sr-card.dark .sr-select option {
    background: rgba(40,40,40,0.95);
    color: #fff;
  }
  
  .sr-card.dark .sr-select option:hover {
    background: rgba(60,60,60,0.95);
  }
  
  /* Enhanced alert styling */
  .sr-body .alert {
    border-radius: 12px;
    border: none;
    backdrop-filter: blur(10px);
    margin-bottom: 20px;
  }
  
  .sr-body .alert-danger {
    background: rgba(220, 53, 69, 0.15);
    color: #fff;
    border: 1px solid rgba(220, 53, 69, 0.3);
  }
  `;
  document.head.appendChild(style);
};

const SystemReportButton = () => {
  injectStyles();

  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.systemReport);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [show, setShow] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [form, setForm] = useState({ title: '', tag: 'SYSTEM', description: '' });

  useEffect(() => {
    if (success) {
      toast.success(success);
      closeModal();
    }
  }, [success]);

  useEffect(() => {
    // Show button with entrance animation after page loads
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Chỉ hiển thị khi đã đăng nhập
  if (!isAuthenticated) {
    return null;
  }

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
      {/* Enhanced Floating Report Button */}
      {showButton && (
      <button
          title="Báo cáo sự cố hệ thống"
          className="position-fixed report-btn-floating report-btn-entrance pulse"
          style={{ 
            left: '20px', 
            bottom: '20px', 
            zIndex: 1060, 
            borderRadius: '50%', 
            width: '60px', 
            height: '60px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        onClick={() => setShow(true)}
      >
          <i className="bi bi-bug-fill report-btn-icon" style={{ fontSize: '1.6rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></i>
      </button>
      )}

      {show && (
        <div className="sr-overlay" onClick={closeModal}>
          {/* Stop propagation to card */}
          <div className={`sr-card ${isDark ? 'dark' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button 
              className="sr-close" 
              onClick={closeModal}
              type="button"
              aria-label="Đóng"
              title="Đóng"
            >
              &times;
            </button>
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
