import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchUserProfileThunk,
  updateProfileThunk,
  updateAvatarThunk,
  changePasswordThunk,
  deactivateAccountThunk,
  deleteAccountThunk,
  requestPhoneChangeThunk,
  verifyPhoneChangeThunk,
  requestDeactivateVerificationThunk,
  verifyDeactivateAccountThunk,
  requestDeleteVerificationThunk,
  verifyDeleteOTPThunk,
  logoutThunk,
} from "../../features/auth/authSlice";
import { toast } from "react-toastify";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import { ROLE_NAMES } from "../../constants/roles";
import styled from "@emotion/styled";
import authAPI from "../../features/auth/authAPI";
import ContractStatus from '../../components/contracts/ContractStatus';
import ApproveTechnicianTest from '../../components/admin/ApproveTechnicianTest'
// --- STYLED COMPONENTS ---

// Main color from the image
const PRIMARY_COLOR = '#f5a623'; // Orange-gold color from the button
const PRIMARY_TEXT_COLOR = '#1c1c1c'; // Black for high contrast on primary color
const TEXT_COLOR = '#1c1c1c';
const MUTED_TEXT_COLOR = '#555555';
const BORDER_COLOR = '#e0e0e0';

const ProfilePageContainer = styled.div`
  background-color: #f9f9f9;
`;

const ContentContainer = styled.div`
  padding: 3rem 0;
`;

const SettingsWrapper = styled.div`
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
  display: flex;
  border: 1px solid ${BORDER_COLOR};
`;

const SettingsSidebar = styled.div`
  width: 280px;
  border-right: 1px solid ${BORDER_COLOR};
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 0.5rem 0 0 0.5rem;
`;

const UserProfile = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  cursor: pointer;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UploadButton = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: ${PRIMARY_COLOR};
  color: ${PRIMARY_TEXT_COLOR};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  transition: all 0.2s;

  &:hover {
    filter: brightness(1.1);
  }
`;

const UserName = styled.h5`
  margin-bottom: 0.25rem;
  font-weight: 600;
  color: ${TEXT_COLOR};
`;

const UserRole = styled.p`
  color: ${MUTED_TEXT_COLOR};
  font-size: 0.9rem;
  text-transform: capitalize;
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.5rem;
`;

const NavLink = styled.a`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: ${(props) => (props.active ? PRIMARY_TEXT_COLOR : TEXT_COLOR)};
  background-color: ${(props) => (props.active ? PRIMARY_COLOR : 'transparent')};
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;

  i {
    margin-right: 0.75rem;
    width: 20px;
    text-align: center;
  }

  &:hover {
    background-color: ${(props) => (props.active ? PRIMARY_COLOR : '#fef5e7')};
    color: ${(props) => (props.active ? PRIMARY_TEXT_COLOR : '#000')};
  }
`;

const SettingsContent = styled.div`
  flex: 1;
  padding: 2.5rem;
`;

const Section = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid ${BORDER_COLOR};
    padding-bottom: 2rem;
    margin-bottom: 2rem;
  }
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`

const SectionTitle = styled.h4`
  font-weight: 600;
  color: ${TEXT_COLOR};
  margin: 0;
`;

// Profile Info Cards Styling
const ProfileInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
`;

const InfoCard = styled.div`
  background: #fff;
  border: 1px solid ${BORDER_COLOR};
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;

  i {
    font-size: 1.25rem;
    margin-right: 0.75rem;
    color: ${PRIMARY_COLOR};
  }

  h6 {
    margin: 0;
    font-weight: 600;
    color: ${TEXT_COLOR};
  }
`;

const CardContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: ${MUTED_TEXT_COLOR};
  min-width: 120px;
`;

const InfoValue = styled.span`
  color: ${TEXT_COLOR};
  font-weight: 500;
  flex: 1;
  text-align: right;
`;

const FormControl = styled.div`
  label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: ${TEXT_COLOR};
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid ${BORDER_COLOR};
    border-radius: 0.375rem;
    background-color: #fff;
    color: ${TEXT_COLOR};
    transition: border-color 0.2s, box-shadow 0.2s;
    
    &:focus {
      outline: none;
      border-color: ${PRIMARY_COLOR};
      box-shadow: 0 0 0 2px rgba(245, 166, 35, 0.2);
    }
    
    &:disabled {
      cursor: not-allowed;
      background-color: #f9f9f9;
      color: ${MUTED_TEXT_COLOR};
    }
  }
`;

const ButtonGroup = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &.btn-primary {
    background-color: ${PRIMARY_COLOR};
    color: ${PRIMARY_TEXT_COLOR};
    &:hover {
      filter: brightness(1.1);
    }
  }

  &.btn-secondary {
    background-color: ${MUTED_TEXT_COLOR};
    color: white;
    &:hover {
      background-color: #f0f0f0;
      color: ${TEXT_COLOR};
    }
  }

  &.btn-light {
    background-color: #f0f0f0;
    color: ${TEXT_COLOR};
    border-color: ${BORDER_COLOR};
    &:hover {
      background-color: #e0e0e0;
    }
  }

  &.btn-danger {
    background-color: #dc3545;
    color: white;
    &:hover {
      background-color: #c82333;
    }
  }
`;

// Security Cards Styling
const SecurityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const SecurityCard = styled.div`
  background: #fff;
  border: 1px solid ${BORDER_COLOR};
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: ${PRIMARY_COLOR};
  }
`;

const SecurityCardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  i {
    font-size: 1.5rem;
    margin-right: 0.75rem;
    color: ${PRIMARY_COLOR};
  }

  h6 {
    margin: 0;
    font-weight: 600;
    color: ${TEXT_COLOR};
  }
`;

const SecurityCardContent = styled.div`
  flex-grow: 1;
  p {
    margin: 0 0 1rem 0;
    color: ${MUTED_TEXT_COLOR};
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const SecurityCardAction = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${BORDER_COLOR};
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;

  h5 {
    margin: 0;
    font-weight: 600;
    color: ${TEXT_COLOR};
  }
  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: ${MUTED_TEXT_COLOR};
    
    &:hover {
      color: ${TEXT_COLOR};
    }
  }
`;

const ModalBody = styled.div``;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid ${BORDER_COLOR};
  padding-top: 1rem;
  margin-top: 1.5rem;
`;

// --- MAIN COMPONENT ---
function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, profileLoading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    city: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [newPhone, setNewPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [showDeactivateVerificationModal, setShowDeactivateVerificationModal] = useState(false);
  const [showDeactivateOtpModal, setShowDeactivateOtpModal] = useState(false);
  const [deactivateOtp, setDeactivateOtp] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteVerificationModal, setShowDeleteVerificationModal] = useState(false);
  const [showDeleteOtpModal, setShowDeleteOtpModal] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteVerificationMethod, setDeleteVerificationMethod] = useState("");
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address?.street || "",
        district: user.address?.district || "",
        city: user.address?.city || "",
      });
      setNewPhone(user.phone || "");
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address?.street || "",
        district: user.address?.district || "",
        city: user.address?.city || "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      fullName: formData.fullName,
      address: {
        street: formData.address,
        district: formData.district,
        city: formData.city,
      },
    };
    try {
      await dispatch(updateProfileThunk(updateData)).unwrap();
      setIsEditing(false);
      toast.success("Cập nhật thành công!");
      setAvatarPreview(null);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 15MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);

      const avatarFormData = new FormData();
      avatarFormData.append("avatar", file);
      try {
        await dispatch(updateAvatarThunk(avatarFormData)).unwrap();
        toast.success("Cập nhật ảnh đại diện thành công!");
      } catch (error) {
        toast.error(error.message || "Lỗi cập nhật ảnh đại diện");
        setAvatarPreview(null);
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    // Kiểm tra nếu user đăng nhập bằng Google
    if (user?.googleId) {
      toast.error("Không thể đổi mật khẩu cho tài khoản đăng nhập bằng Google");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Mật khẩu mới và xác nhận không khớp");
    }
    if (passwordData.newPassword.length < 8) {
      return toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
    }
    try {
      await dispatch(
        changePasswordThunk({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      ).unwrap();
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowChangePasswordModal(false);
      toast.success("Đổi mật khẩu thành công!");
    } catch (error) {
      toast.error(error.message || "Có lỗi khi đổi mật khẩu");
    }
  };

  const handleRequestPhoneChange = async (e) => {
    e.preventDefault();
    try {
      await dispatch(requestPhoneChangeThunk({ newPhone })).unwrap();
      setShowPhoneModal(false);
      setShowOtpModal(true);
      toast.success("Đã gửi mã OTP đến số điện thoại mới!");
    } catch (error) {
      toast.error(error.message || "Không thể gửi OTP");
    }
  };

  const handleVerifyPhoneChange = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        verifyPhoneChangeThunk({ otp, newPhone })
      ).unwrap();
      setShowOtpModal(false);
      toast.success("Xác thực số điện thoại thành công!");
      dispatch(fetchUserProfileThunk());
    } catch (error) {
      toast.error(error.message || "Mã OTP không đúng hoặc đã hết hạn");
    }
  };

  const handleDeactivate = async () => {
    // Nếu user đăng nhập bằng Google (có googleId), không cần xác thực
    if (user?.googleId) {
      try {
        await dispatch(deactivateAccountThunk("")).unwrap();
        setShowDeactivateModal(false);
        toast.success("Tài khoản đã được vô hiệu hóa thành công. Bạn sẽ được đăng xuất.");
        // Đăng xuất và chuyển hướng về trang đăng nhập
        setTimeout(async () => {
          try {
            await dispatch(logoutThunk());
            sessionStorage.clear();
            navigate('/login');
          } catch (error) {
            console.error('Logout error:', error);
            sessionStorage.clear();
            navigate('/login');
          }
        }, 2000);
      } catch (e) {
        toast.error(e || "Không thể vô hiệu hóa tài khoản.");
      }
      return;
    }
    // Kiểm tra xem user có thông tin liên hệ không
    if (!user?.email && !user?.phone) {
      toast.error("Không có thông tin email hoặc số điện thoại để xác thực");
      return;
    }
    // Nếu chỉ có một phương thức, sử dụng phương thức đó
    if (!user?.email) {
      setVerificationMethod('phone');
      setShowDeactivateModal(false);
      setShowDeactivateVerificationModal(true);
    } else if (!user?.phone) {
      setVerificationMethod('email');
      setShowDeactivateModal(false);
      setShowDeactivateVerificationModal(true);
    } else {
      // Có cả email và phone, hiển thị modal chọn phương thức
      setShowDeactivateModal(false);
      setShowDeactivateVerificationModal(true);
    }
  };

  const handleRequestDeactivateVerification = async (method) => {
    try {
      await dispatch(requestDeactivateVerificationThunk(method)).unwrap();
      setVerificationMethod(method);
      setShowDeactivateVerificationModal(false);
      setShowDeactivateOtpModal(true);
    } catch (error) {
      toast.error(error || "Không thể gửi mã xác thực");
    }
  };

  const handleVerifyDeactivateAccount = async (e) => {
    e.preventDefault();
    if (!deactivateOtp.trim()) {
      toast.error("Vui lòng nhập mã xác thực");
      return;
    }
    try {
      await dispatch(verifyDeactivateAccountThunk(deactivateOtp)).unwrap();
      setShowDeactivateOtpModal(false);
      setDeactivateOtp("");
      // Đăng xuất và chuyển hướng về trang đăng nhập
      setTimeout(() => {
        dispatch({ type: 'auth/logout' });
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error || "Không thể vô hiệu hóa tài khoản");
    }
  };

  const handleDelete = async () => {
    // Nếu là user Google, bỏ qua bước nhập mật khẩu
    if (user?.googleId) {
      setShowDeleteModal(false);
      setShowDeleteVerificationModal(true);
    } else {
      // Nếu là user thường, hiển thị modal nhập mật khẩu trước
      setShowDeleteModal(false);
      setShowDeletePasswordModal(true);
    }
  };

  const handleDeletePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!deletePassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }
    // Lưu mật khẩu và chuyển sang bước chọn phương thức xác thực
    setShowDeletePasswordModal(false);
    setShowDeleteVerificationModal(true);
  };

  // Delete account handlers
  const handleRequestDeleteVerification = async (method) => {
    try {
      await dispatch(requestDeleteVerificationThunk(method)).unwrap();
      setDeleteVerificationMethod(method);
      setShowDeleteVerificationModal(false);
      setShowDeleteOtpModal(true);
    } catch (error) {
      toast.error(error || "Không thể gửi mã xác thực");
    }
  };

  const handleVerifyDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteOtp.trim()) {
      toast.error("Vui lòng nhập mã xác thực");
      return;
    }

    try {
      await dispatch(verifyDeleteOTPThunk(deleteOtp)).unwrap();
      setShowDeleteOtpModal(false);
      setDeleteOtp("");
      // Hiển thị modal xác nhận cuối cùng
      setShowDeleteConfirmModal(true);
    } catch (error) {
      toast.error(error || "Không thể xác thực");
    }
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Vui lòng nhập chính xác "DELETE" để xác nhận');
      return;
    }

    try {
      await dispatch(deleteAccountThunk({ 
        password: deletePassword, 
        confirmText: deleteConfirmText 
      })).unwrap();
      
      // Reset tất cả state liên quan đến xóa tài khoản
      setShowDeleteModal(false);
      setShowDeletePasswordModal(false);
      setShowDeleteVerificationModal(false);
      setShowDeleteOtpModal(false);
      setShowDeleteConfirmModal(false);
      setDeletePassword("");
      setDeleteConfirmText("");
      setDeleteOtp("");
      setDeleteVerificationMethod("");
      setAccountDeleted(true);
      
      // Reset state vô hiệu hóa tài khoản nếu có
      setShowDeactivateModal(false);
      setShowDeactivateVerificationModal(false);
      setShowDeactivateOtpModal(false);
      setDeactivatePassword("");
      setDeactivateOtp("");
      setVerificationMethod("");
      
      toast.success("Tài khoản đã được đánh dấu để xóa. Bạn có 30 ngày để đăng nhập lại nếu muốn hủy bỏ việc xóa tài khoản.");
      
      // Đăng xuất và chuyển hướng về trang đăng nhập
      setTimeout(async () => {
        try {
          await dispatch(logoutThunk());
          // Clear localStorage để đảm bảo không còn token
          // localStorage.removeItem('token');
          sessionStorage.clear();
          navigate('/login');
        } catch (error) {
          console.error('Logout error:', error);
          // Nếu logout thất bại, vẫn chuyển hướng
          // localStorage.removeItem('token');
          sessionStorage.clear();
          navigate('/login');
        }
      }, 3000);
    } catch (error) {
      toast.error(error || "Không thể xóa tài khoản");
    }
  };

  // Hàm tạo địa chỉ đầy đủ
  const getFullAddress = () => {
    const parts = [];
    if (formData.address) parts.push(formData.address);
    if (formData.district) parts.push(formData.district);
    if (formData.city) parts.push(formData.city);
    return parts.length > 0 ? parts.join(", ") : "Chưa cập nhật";
  };

  const renderSidebar = () => (
    <SettingsSidebar>
      <UserProfile>
        <AvatarWrapper onClick={handleAvatarClick}>
          <Avatar src={avatarPreview || user?.avatar || "/img/profiles/avatar-01.jpg"} alt="Ảnh đại diện" />
          <UploadButton>
            <i className="bi bi-camera-fill"></i>
          </UploadButton>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            style={{ display: "none" }}
            accept="image/*"
          />
        </AvatarWrapper>
        <UserName>{user?.fullName}</UserName>
        <UserRole>{user?.role?.name ? ROLE_NAMES[user.role.name] || user.role.name : 'Người dùng'}</UserRole>
      </UserProfile>
      <NavMenu>
        <NavItem>
          <NavLink href="#" active={activeTab === 'profile'} onClick={(e) => {e.preventDefault(); setActiveTab('profile');}}>
            <i className="bi bi-person-circle"></i> Hồ sơ
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="#" active={activeTab === 'security'} onClick={(e) => {e.preventDefault(); setActiveTab('security');}}>
            <i className="bi bi-shield-lock-fill"></i> Bảo mật
          </NavLink>
        </NavItem>
      </NavMenu>
    </SettingsSidebar>
  );

  const renderProfileContent = () => (
    <Section>
        <SectionHeader>
            <SectionTitle>Thông tin hồ sơ</SectionTitle>
            {!isEditing && (
                <Button className="btn-primary" onClick={() => setIsEditing(true)}>
                    <i className="bi bi-pencil-fill"></i>
                    Chỉnh sửa
                </Button>
            )}
        </SectionHeader>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <ProfileInfoContainer>
            <InfoCard>
              <CardHeader>
                <i className="bi bi-person-fill"></i>
                <h6>Thông tin cá nhân</h6>
              </CardHeader>
              <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormControl>
                  <label htmlFor="fullName">Họ và tên</label>
                  <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <label htmlFor="email">Địa chỉ email</label>
                  <input type="email" id="email" name="email" value={formData.email} disabled />
                </FormControl>
                <FormControl>
                  <label htmlFor="phone">Số điện thoại</label>
                  <input type="text" id="phone" name="phone" value={formData.phone} disabled />
                </FormControl>
              </div>
            </InfoCard>
            <InfoCard>
              <CardHeader>
                <i className="bi bi-geo-alt-fill"></i>
                <h6>Địa chỉ</h6>
              </CardHeader>
              <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormControl>
                  <label htmlFor="address">Địa chỉ</label>
                  <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Số nhà, tên đường" />
                </FormControl>
                <FormControl>
                  <label htmlFor="district">Quận/Huyện</label>
                  <input type="text" id="district" name="district" value={formData.district} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <label htmlFor="city">Tỉnh/Thành phố</label>
                  <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} />
                </FormControl>
              </div>
            </InfoCard>
          </ProfileInfoContainer>
          <ButtonGroup>
            <Button type="button" className="btn-light" onClick={handleCancel}>Hủy</Button>
            <Button type="submit" className="btn-primary">Lưu thay đổi</Button>
          </ButtonGroup>
        </form>
      ) : (
        <ProfileInfoContainer>
          <InfoCard>
            <CardHeader>
              <i className="bi bi-person-fill"></i>
              <h6>Thông tin cá nhân</h6>
            </CardHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
              <CardContent>
                <InfoLabel>Họ và tên:</InfoLabel>
                <InfoValue>{formData.fullName || "Chưa cập nhật"}</InfoValue>
              </CardContent>
            </div>
          </InfoCard>
          <InfoCard>
            <CardHeader>
              <i className="bi bi-envelope-fill"></i>
              <h6>Thông tin liên hệ</h6>
            </CardHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
              <CardContent>
                <InfoLabel>Email:</InfoLabel>
                <InfoValue>{formData.email || "Chưa cập nhật"}</InfoValue>
              </CardContent>
              <CardContent>
                <InfoLabel>Số điện thoại:</InfoLabel>
                <InfoValue>{formData.phone || "Chưa cập nhật"}</InfoValue>
              </CardContent>
            </div>
          </InfoCard>
          <InfoCard>
            <CardHeader>
              <i className="bi bi-geo-alt-fill"></i>
              <h6>Địa chỉ</h6>
            </CardHeader>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
                 <CardContent>
                    <InfoLabel>Địa chỉ:</InfoLabel>
                    <InfoValue>{getFullAddress()}</InfoValue>
                </CardContent>
            </div>
          </InfoCard>
        </ProfileInfoContainer>
      )}
    </Section>
  );

  const renderSecurityContent = () => (
    <Section>
      <SectionHeader>
        <SectionTitle>Cài đặt bảo mật</SectionTitle>
      </SectionHeader>
      <SecurityGrid>
        {/* Chỉ hiển thị "Đổi mật khẩu" nếu user không đăng nhập bằng Google */}
        {!user?.googleId && (
          <SecurityCard>
            <SecurityCardHeader>
              <i className="bi bi-key-fill"></i>
              <h6>Đổi mật khẩu</h6>
            </SecurityCardHeader>
            <SecurityCardContent>
              <p>Đặt mật khẩu mới để bảo vệ tài khoản của bạn.</p>
            </SecurityCardContent>
            <SecurityCardAction>
              <Button className="btn-primary" onClick={() => setShowChangePasswordModal(true)}>Thay đổi</Button>
            </SecurityCardAction>
          </SecurityCard>
        )}

        <SecurityCard>
          <SecurityCardHeader>
            <i className="bi bi-telephone-fill"></i>
            <h6>Số điện thoại</h6>
          </SecurityCardHeader>
          <SecurityCardContent>
            <p>Cập nhật số điện thoại để khôi phục tài khoản khi cần thiết.</p>
          </SecurityCardContent>
          <SecurityCardAction>
            <Button className="btn-primary" onClick={() => setShowPhoneModal(true)}>Thay đổi</Button>
          </SecurityCardAction>
        </SecurityCard>

        <SecurityCard>
          <SecurityCardHeader>
            <i className="bi bi-pause-circle-fill"></i>
            <h6>Vô hiệu hóa tài khoản</h6>
          </SecurityCardHeader>
          <SecurityCardContent>
            <p>Tạm thời vô hiệu hóa tài khoản của bạn.</p>
          </SecurityCardContent>
          <SecurityCardAction>
            <Button className="btn-secondary" onClick={() => setShowDeactivateModal(true)}>Vô hiệu hóa</Button>
          </SecurityCardAction>
        </SecurityCard>

        <SecurityCard>
          <SecurityCardHeader>
            <i className="bi bi-trash-fill"></i>
            <h6>Xóa tài khoản</h6>
          </SecurityCardHeader>
          <SecurityCardContent>
            <p>Xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan.</p>
          </SecurityCardContent>
          <SecurityCardAction>
            {user?.role?.name === 'ADMIN' ? (
              <Button className="btn-danger" disabled style={{ opacity: 0.6 }}>
                Quản trị viên không thể xóa tài khoản
              </Button>
            ) : (
              <Button className="btn-danger" onClick={handleDelete}>
                Xóa tài khoản
              </Button>
            )}
          </SecurityCardAction>
        </SecurityCard>
      </SecurityGrid>
    </Section>
  );

  const renderChangePasswordModal = () => (
    <ModalBackdrop>
      <ModalContent>
        <form onSubmit={handleChangePassword}>
          <ModalHeader>
            <h5>Đổi mật khẩu</h5>
            <button type="button" onClick={() => setShowChangePasswordModal(false)}>&times;</button>
          </ModalHeader>
          <ModalBody>
            <FormControl>
              <label>Mật khẩu hiện tại</label>
              <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
            </FormControl>
            <FormControl style={{marginTop: '1rem'}}>
              <label>Mật khẩu mới</label>
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required />
            </FormControl>
             <FormControl style={{marginTop: '1rem'}}>
              <label>Xác nhận mật khẩu mới</label>
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button type="button" className="btn-light" onClick={() => setShowChangePasswordModal(false)}>Hủy</Button>
            <Button type="submit" className="btn-primary">Lưu thay đổi</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalBackdrop>
  );

  const renderPhoneModal = () => (
    <ModalBackdrop>
      <ModalContent>
        <form onSubmit={handleRequestPhoneChange}>
          <ModalHeader>
            <h5>Thay đổi số điện thoại</h5>
            <button type="button" onClick={() => setShowPhoneModal(false)}>&times;</button>
          </ModalHeader>
          <ModalBody>
            <FormControl>
              <label>Số điện thoại mới</label>
              <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button type="button" className="btn-light" onClick={() => setShowPhoneModal(false)}>Hủy</Button>
            <Button type="submit" className="btn-primary">Gửi mã OTP</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalBackdrop>
  );

  const renderOtpModal = () => (
    <ModalBackdrop>
        <ModalContent>
            <form onSubmit={handleVerifyPhoneChange}>
                <ModalHeader>
                    <h5>Xác thực số điện thoại</h5>
                    <button type="button" onClick={() => setShowOtpModal(false)}>&times;</button>
                </ModalHeader>
                <ModalBody>
                    <p>Nhập mã 6 số đã được gửi đến {newPhone}.</p>
                    <FormControl>
                        <label>Mã OTP</label>
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6" required />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button type="button" className="btn-light" onClick={() => setShowOtpModal(false)}>Hủy</Button>
                    <Button type="submit" className="btn-primary">Xác thực</Button>
                </ModalFooter>
            </form>
        </ModalContent>
    </ModalBackdrop>
  );

  const renderDeactivateModal = () => (
    <ModalBackdrop>
      <ModalContent>
        <ModalHeader>
          <h5>Vô hiệu hóa tài khoản</h5>
           <button type="button" onClick={() => {
             setShowDeactivateModal(false);
             setDeactivatePassword("");
           }}>&times;</button>
        </ModalHeader>
        <ModalBody>
          <p>Bạn có chắc chắn muốn vô hiệu hóa tài khoản? Bạn có thể kích hoạt lại bất cứ lúc nào bằng cách đăng nhập.</p>
          
          {user?.googleId && user.googleId !== null && user.googleId !== undefined ? (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              marginTop: '1rem',
              border: '1px solid #dee2e6'
            }}>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
                <i className="bi bi-info-circle-fill" style={{ marginRight: '0.5rem', color: '#0d6efd' }}></i>
                Tài khoản của bạn được đăng nhập bằng Google, không cần xác thực.
              </p>
            </div>
          ) : (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              marginTop: '1rem',
              border: '1px solid #dee2e6'
            }}>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
                <i className="bi bi-shield-check-fill" style={{ marginRight: '0.5rem', color: '#28a745' }}></i>
                Để đảm bảo an toàn, chúng tôi sẽ gửi mã xác thực đến {user?.email && user?.phone ? 'email hoặc số điện thoại' : user?.email ? 'email' : 'số điện thoại'} của bạn.
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" className="btn-light" onClick={() => {
            setShowDeactivateModal(false);
            setDeactivatePassword("");
          }}>Hủy</Button>
          <Button type="button" className="btn-secondary" onClick={handleDeactivate}>
            Vô hiệu hóa
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalBackdrop>
  );

  const renderDeleteModal = () => (
     <ModalBackdrop>
      <ModalContent>
        <ModalHeader>
          <h5>Xóa tài khoản</h5>
          <button type="button" onClick={() => setShowDeleteModal(false)}>&times;</button>
        </ModalHeader>
        <ModalBody>
          <p><strong>Cảnh báo:</strong> Hành động này là vĩnh viễn và không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa.</p>
          <p>Bạn có thực sự chắc chắn muốn xóa tài khoản?</p>
        </ModalBody>
        <ModalFooter>
          <Button type="button" className="btn-light" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button type="button" className="btn-danger" onClick={() => {
            setShowDeleteModal(false);
            // Không gọi handleDelete nữa, chỉ chuyển đến modal xác nhận cuối cùng
          }}>Tiếp tục</Button>
        </ModalFooter>
      </ModalContent>
    </ModalBackdrop>
  );

  const renderDeactivateVerificationModal = () => (
    <ModalBackdrop>
      <ModalContent>
        <ModalHeader>
          <h5>Chọn phương thức xác thực</h5>
          <button type="button" onClick={() => setShowDeactivateVerificationModal(false)}>&times;</button>
        </ModalHeader>
        <ModalBody>
          <p>Vui lòng chọn phương thức để nhận mã xác thực:</p>
          
          {user?.email && user?.phone ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Button 
                type="button" 
                className="btn-outline-primary" 
                onClick={() => handleRequestDeactivateVerification('email')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="bi bi-envelope-fill" style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}></i>
                  <div>
                    <div style={{ fontWeight: '600' }}>Gửi qua Email</div>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{user.email}</div>
                  </div>
                </div>
                <i className="bi bi-chevron-right"></i>
              </Button>
              
              <Button 
                type="button" 
                className="btn-outline-primary" 
                onClick={() => handleRequestDeactivateVerification('phone')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="bi bi-telephone-fill" style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}></i>
                  <div>
                    <div style={{ fontWeight: '600' }}>Gửi qua SMS</div>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{user.phone}</div>
                  </div>
                </div>
                <i className="bi bi-chevron-right"></i>
              </Button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <i className="bi bi-shield-check-fill" style={{ fontSize: '3rem', color: '#28a745', marginBottom: '1rem' }}></i>
              <p>Mã xác thực sẽ được gửi đến {user?.email ? 'email' : 'số điện thoại'} của bạn.</p>
              <Button 
                type="button" 
                className="btn-primary" 
                onClick={() => handleRequestDeactivateVerification(verificationMethod)}
              >
                Gửi mã xác thực
              </Button>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" className="btn-light" onClick={() => setShowDeactivateVerificationModal(false)}>Hủy</Button>
        </ModalFooter>
      </ModalContent>
    </ModalBackdrop>
  );

  const renderDeactivateOtpModal = () => (
    <ModalBackdrop>
      <ModalContent>
        <form onSubmit={handleVerifyDeactivateAccount}>
          <ModalHeader>
            <h5>Xác thực vô hiệu hóa tài khoản</h5>
            <button type="button" onClick={() => {
              setShowDeactivateOtpModal(false);
              setDeactivateOtp("");
            }}>&times;</button>
          </ModalHeader>
          <ModalBody>
            <p>Nhập mã 6 số đã được gửi đến {verificationMethod === 'email' ? 'email' : 'số điện thoại'} của bạn.</p>
            <FormControl>
              <label>Mã xác thực</label>
              <input 
                type="text" 
                value={deactivateOtp} 
                onChange={(e) => setDeactivateOtp(e.target.value)} 
                maxLength="6" 
                placeholder="Nhập mã 6 số"
                required 
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button type="button" className="btn-light" onClick={() => {
              setShowDeactivateOtpModal(false);
              setDeactivateOtp("");
            }}>Hủy</Button>
            <Button type="submit" className="btn-secondary">Vô hiệu hóa</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalBackdrop>
  );

  // Delete account modals
  const renderDeleteVerificationModal = () => (
    <ModalBackdrop>
      <ModalContent>
        <ModalHeader>
          <h5>Chọn phương thức xác thực</h5>
          <button type="button" onClick={() => setShowDeleteVerificationModal(false)}>&times;</button>
        </ModalHeader>
        <ModalBody>
          <p>Vui lòng chọn phương thức để nhận mã xác thực:</p>
          
          {user?.email && user?.phone ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Button 
                type="button" 
                className="btn-outline-primary" 
                onClick={() => handleRequestDeleteVerification('email')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="bi bi-envelope-fill" style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}></i>
                  <div>
                    <div style={{ fontWeight: '600' }}>Gửi qua Email</div>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{user.email}</div>
                  </div>
                </div>
                <i className="bi bi-chevron-right"></i>
              </Button>
              
              <Button 
                type="button" 
                className="btn-outline-primary" 
                onClick={() => handleRequestDeleteVerification('phone')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="bi bi-telephone-fill" style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}></i>
                  <div>
                    <div style={{ fontWeight: '600' }}>Gửi qua SMS</div>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{user.phone}</div>
                  </div>
                </div>
                <i className="bi bi-chevron-right"></i>
              </Button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <i className="bi bi-shield-check-fill" style={{ fontSize: '3rem', color: '#28a745', marginBottom: '1rem' }}></i>
              <p>Mã xác thực sẽ được gửi đến {user?.email ? 'email' : 'số điện thoại'} của bạn.</p>
              <Button 
                type="button" 
                className="btn-primary" 
                onClick={() => handleRequestDeleteVerification(user?.email ? 'email' : 'phone')}
              >
                Gửi mã xác thực
              </Button>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" className="btn-light" onClick={() => setShowDeleteVerificationModal(false)}>Hủy</Button>
        </ModalFooter>
      </ModalContent>
    </ModalBackdrop>
  );

  const renderDeleteOtpModal = () => (
    <ModalBackdrop>
      <ModalContent>
        <form onSubmit={handleVerifyDeleteAccount}>
          <ModalHeader>
            <h5>Xác thực xóa tài khoản</h5>
            <button type="button" onClick={() => {
              setShowDeleteOtpModal(false);
              setDeleteOtp("");
            }}>&times;</button>
          </ModalHeader>
          <ModalBody>
            <p>Nhập mã 6 số đã được gửi đến {deleteVerificationMethod === 'email' ? 'email' : 'số điện thoại'} của bạn.</p>
            <FormControl>
              <label>Mã xác thực</label>
              <input 
                type="text" 
                value={deleteOtp} 
                onChange={(e) => setDeleteOtp(e.target.value)} 
                maxLength="6" 
                placeholder="Nhập mã 6 số"
                required 
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button type="button" className="btn-light" onClick={() => {
              setShowDeleteOtpModal(false);
              setDeleteOtp("");
            }}>Hủy</Button>
            <Button type="submit" className="btn-danger">Xác thực</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalBackdrop>
  );

  const renderDeletePasswordModal = () => {
    return (
      <ModalBackdrop>
        <ModalContent>
          <form onSubmit={handleDeletePasswordSubmit}>
            <ModalHeader>
              <h5>Xác thực xóa tài khoản</h5>
              <button type="button" onClick={() => {
                setShowDeletePasswordModal(false);
                setDeletePassword("");
              }}>&times;</button>
            </ModalHeader>
            <ModalBody>
              <p>Vui lòng nhập mật khẩu của bạn để xác thực việc xóa tài khoản.</p>
              <FormControl>
                <label>Mật khẩu</label>
                <input 
                  type="password" 
                  value={deletePassword} 
                  onChange={(e) => setDeletePassword(e.target.value)} 
                  placeholder="Nhập mật khẩu của bạn"
                  required 
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button type="button" className="btn-light" onClick={() => {
                setShowDeletePasswordModal(false);
                setDeletePassword("");
              }}>Hủy</Button>
              <Button type="submit" className="btn-danger">Xác thực</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalBackdrop>
    );
  };

  const renderDeleteConfirmModal = () => (
    <ModalBackdrop>
      <ModalContent>
        <form onSubmit={handleConfirmDelete}>
          <ModalHeader>
            <h5>Xác nhận xóa tài khoản</h5>
            <button type="button" onClick={() => {
              setShowDeleteConfirmModal(false);
              setDeletePassword("");
              setDeleteConfirmText("");
            }}>&times;</button>
          </ModalHeader>
          <ModalBody>
            <div style={{ 
              background: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, color: '#856404', fontWeight: 'bold' }}>
                ⚠️ Cảnh báo: Tài khoản sẽ được đánh dấu để xóa!
              </p>
              <p style={{ margin: '0.5rem 0 0 0', color: '#856404', fontSize: '0.9rem' }}>
                Bạn có 30 ngày để đăng nhập lại nếu muốn hủy bỏ việc xóa tài khoản.
              </p>
            </div>
            
            <p><strong>Thông tin sẽ bị xóa:</strong></p>
            <ul>
              <li>Thông tin cá nhân (họ tên, email, số điện thoại, địa chỉ)</li>
              <li>Ảnh đại diện</li>
              <li>Lịch sử đăng nhập</li>
              {user?.role?.name === 'TECHNICIAN' && (
                <li>Thông tin kỹ thuật viên và chứng chỉ</li>
              )}
            </ul>
            
            <p><strong>Dữ liệu sẽ được giữ lại (ẩn thông tin cá nhân):</strong></p>
            <ul>
              <li>Lịch sử booking (cho báo cáo)</li>
              <li>Feedback và đánh giá</li>
              <li>Giao dịch thanh toán</li>
            </ul>

            <FormControl style={{ marginTop: '1rem' }}>
              <label>Xác nhận xóa tài khoản</label>
              <input 
                type="text" 
                value={deleteConfirmText} 
                onChange={(e) => setDeleteConfirmText(e.target.value)} 
                placeholder="Nhập 'DELETE' để xác nhận"
                required 
              />
              <small style={{ color: '#6c757d' }}>
                Vui lòng nhập chính xác "DELETE" để xác nhận việc xóa tài khoản
              </small>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button type="button" className="btn-light" onClick={() => {
              setShowDeleteConfirmModal(false);
              setDeletePassword("");
              setDeleteConfirmText("");
            }}>Hủy</Button>
            <Button type="submit" className="btn-danger">Xóa tài khoản</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalBackdrop>
  );

  if (profileLoading && !user) {
    return <div>Đang tải...</div>;
  }

  if (accountDeleted) {
    return (
      <ProfilePageContainer>
        <Header />
        <BreadcrumbBar title="Cài đặt người dùng" />
        <ContentContainer>
          <div className="container">
            <div style={{textAlign: 'center', padding: '3rem 0'}}>
              <h3>Tài khoản của bạn đang được xử lý xóa...</h3>
              <p>Bạn sẽ được chuyển hướng về trang đăng nhập trong giây lát.</p>
            </div>
          </div>
        </ContentContainer>
        <Footer />
      </ProfilePageContainer>
    );
  }

  return (
    <ProfilePageContainer>
      <Header />
      <BreadcrumbBar title="Cài đặt người dùng" />
      <ContentContainer>
        <div className="container">
          <SettingsWrapper>
            {renderSidebar()}
            <SettingsContent>
              {activeTab === 'profile' && renderProfileContent()}
              {activeTab === 'security' && renderSecurityContent()}
            </SettingsContent>
          </SettingsWrapper>
        </div>
      </ContentContainer>
      <Footer />
      {showChangePasswordModal && !user?.googleId && renderChangePasswordModal()}
      {showPhoneModal && renderPhoneModal()}
      {showOtpModal && renderOtpModal()}
      {showDeactivateModal && renderDeactivateModal()}
      {showDeleteModal && renderDeleteModal()}
      {showDeactivateVerificationModal && renderDeactivateVerificationModal()}
      {showDeactivateOtpModal && renderDeactivateOtpModal()}
      {showDeleteVerificationModal && renderDeleteVerificationModal()}
      {showDeleteOtpModal && renderDeleteOtpModal()}
      {showDeletePasswordModal && !accountDeleted && renderDeletePasswordModal()}
      {showDeleteConfirmModal && !accountDeleted && renderDeleteConfirmModal()}
    </ProfilePageContainer>
  );
}

export default ProfilePage;
