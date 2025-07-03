import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const TechnicianOnboardingModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, verificationStatus, isAuthenticated, technician } = useSelector((state) => state.auth);
  const [internalHide, setInternalHide] = useState(false);

  const [mode, setMode] = useState(null); // 'VERIFY' | 'COMPLETE'

  useEffect(() => {
    // Reset internalHide mỗi khi quay lại trang /profile
    if (location.pathname === '/profile' && internalHide) {
      setInternalHide(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role?.name !== 'TECHNICIAN') return;

    // Điều kiện hiển thị
    const needVerify = (verificationStatus?.step === 'VERIFY_EMAIL' || verificationStatus?.step === 'VERIFY_PHONE') && !location.pathname.startsWith('/verify-');
    
    // Kiểm tra profile completion dựa trên các trường thực tế
    const profileCompleted = (() => {
      if (!technician) return false;
      const hasSpecialties = Array.isArray(technician.specialtiesCategories) && technician.specialtiesCategories.length > 0;
      const hasCertificates = Array.isArray(technician.certificate) && technician.certificate.length > 0;
      const hasIdentification = technician.identification && technician.identification.trim() !== '';
      const hasFrontIdImage = technician.frontIdImage && technician.frontIdImage.trim() !== '';
      const hasBackIdImage = technician.backIdImage && technician.backIdImage.trim() !== '';
      
      return hasSpecialties && hasCertificates && hasIdentification && hasFrontIdImage && hasBackIdImage;
    })();
    
    const needComplete = verificationStatus?.step === 'COMPLETE_PROFILE' && !profileCompleted && location.pathname !== '/technician/complete-profile';

    if (needVerify || needComplete) {
      // Khi cần hiển thị modal
      if (location.pathname === '/profile') {
        setMode(needVerify ? 'VERIFY' : 'COMPLETE');
        setInternalHide(false); // reset nếu quay lại profile
      }
    } else {
      // Đã hoàn tất mọi yêu cầu → bảo đảm modal không còn hiển thị
      if (mode !== null) {
        setMode(null);
      }
    }

  }, [isAuthenticated, user, verificationStatus, technician, location.pathname]);

  const shouldShow = !internalHide && mode && location.pathname === '/profile';

  if (!shouldShow) return null;

  const handleAccept = () => {
    setInternalHide(true);
    if (mode === 'VERIFY') {
      navigate(verificationStatus?.redirectTo || '/verify-email');
    } else if (mode === 'COMPLETE') {
      navigate('/technician/complete-profile');
    }
  };

  const handleDecline = () => {
    setInternalHide(true);
    navigate('/');
  };

  return (
    <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Hoàn thiện đăng ký</h5>
          </div>
          <div className="modal-body">
            {mode === 'VERIFY' ? (
              <p>Bạn cần xác thực tài khoản và hoàn thiện hồ sơ kỹ thuật viên để sử dụng đầy đủ tính năng của FixTech. Tiếp tục ngay?</p>
            ) : (
              <p>Bạn cần hoàn thiện hồ sơ kỹ thuật viên để sử dụng đầy đủ tính năng của FixTech. Tiếp tục ngay?</p>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleDecline}>Để sau</button>
            <button className="btn btn-primary" onClick={handleAccept}>Đồng ý</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianOnboardingModal; 