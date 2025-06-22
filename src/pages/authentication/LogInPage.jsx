import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginThunk, googleLoginThunk } from "../../features/auth/authSlice";
import authAPI from "../../features/auth/authAPI";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import "../../styles/auth.css";
import Swal from "sweetalert2";
import store from "../../app/store";

function LogInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { verificationStatus } = useSelector((state) => state.auth);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for the field being edited
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (errors.form) {
        setErrors(prev => ({ ...prev, form: null }));
    }
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
        newErrors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Địa chỉ email không hợp lệ.";
    }

    if (!formData.password.trim()) {
        newErrors.password = "Vui lòng nhập mật khẩu.";
    }
    return newErrors;
  };

  const handleServerError = (errorMessage) => {
    const newErrors = {};
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes('vô hiệu hóa bởi quản trị viên') || lowerMessage.includes('admin')) {
        newErrors.form = 'Tài khoản của bạn đã bị vô hiệu hóa bởi quản trị viên. Vui lòng liên hệ với quản trị viên để được hỗ trợ.';
    } else if (lowerMessage.includes('password') || lowerMessage.includes('credentials') || lowerMessage.includes('không đúng') || lowerMessage.includes('user not found')) {
        newErrors.form = 'Email hoặc mật khẩu không đúng.';
    } else if (lowerMessage.includes('email') && lowerMessage.includes('not found')) {
        newErrors.form = 'Tài khoản không tồn tại.';
    } else {
        newErrors.form = 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      const result = await dispatch(loginThunk(formData)).unwrap();
      
      // Kiểm tra verificationStatus trước
      if (result.verificationStatus && result.verificationStatus.redirectTo) {
        navigate(result.verificationStatus.redirectTo, { replace: true });
      } else if (result.user.role.name === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      
    } catch (error) {
      const errorMessage = error || "Đăng nhập thất bại. Vui lòng thử lại.";
      handleServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: "email profile",
        callback: async (response) => {
          if (response.error) {
            toast.error("Đăng nhập Google bị hủy.");
            setIsLoading(false);
            return;
          }
          try {
            const result = await dispatch(googleLoginThunk(response.access_token)).unwrap();

            if (result.verificationStatus && result.verificationStatus.redirectTo) {
              navigate(result.verificationStatus.redirectTo, { replace: true });
            } else if (result.user.role.name === "ADMIN") {
              navigate("/admin/dashboard", { replace: true });
            } else {
              navigate("/", { replace: true });
            }
          } catch (error) {
            toast.error(error || "Đăng nhập Google thất bại");
          } finally {
            setIsLoading(false);
          }
        },
        error_callback: () => {
          toast.error("Đăng nhập Google bị đóng.");
          setIsLoading(false);
        }
      });

      client.requestAccessToken();
    } catch (error) {
      toast.error("Không thể khởi tạo đăng nhập Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="main-wrapper login-body">
      <header className="log-header">
        <a href="/">
          <img className="img-fluid logo-dark" src="/img/logo.png" alt="Logo" />
        </a>
      </header>

      <div className="login-wrapper">
        <div className="loginbox">
          <div className="login-auth">
            <div className="login-auth-wrap">
              <h1 className="text-center mb-4 text-dark">Đăng Nhập</h1>
              <p className="text-center text-secondary mb-4">
                Vui lòng đăng nhập để tiếp tục sử dụng dịch vụ
              </p>

              <form onSubmit={handleSubmit} className="needs-validation">
                {errors.form && 
                  <div className="alert alert-danger" role="alert">
                    {errors.form}
                  </div>
                }
                <div className="input-block mb-3">
                  <label className="form-label text-dark">
                    Email <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <span className="position-absolute top-50 translate-middle-y ps-3">
                      <FaEnvelope className="text-secondary" />
                    </span>
                    <input
                      type="email"
                      className={`form-control ps-5 bg-white ${errors.email || errors.form ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Nhập email của bạn"
                    />
                  </div>
                  {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                </div>

                <div className="input-block mb-3">
                  <label className="form-label text-dark">
                    Mật khẩu <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <span
                      className="position-absolute top-50 translate-middle-y ps-3"
                      style={{ zIndex: 2 }}
                    >
                      <FaLock className="text-secondary" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ps-5 pe-5 bg-white ${errors.password || errors.form ? 'is-invalid' : ''}`}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu của bạn"
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 text-secondary pe-3"
                      onClick={togglePasswordVisibility}
                      style={{ zIndex: 2 }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                   {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                    />
                    <label
                      className="form-check-label text-secondary"
                      htmlFor="rememberMe"
                    >
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                  <a href="/forgot-password" className="text-primary fw-medium">
                    Quên mật khẩu?
                  </a>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 btn-size mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="d-flex justify-content-center align-items-center">
                      <span
                        className="spinner-border spinner-custom-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span>ĐANG XỬ LÝ...</span>
                    </span>
                  ) : (
                    "ĐĂNG NHẬP"
                  )}
                </button>

                <div className="text-center mb-4">
                  <p className="text-secondary mb-0">Hoặc</p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="btn btn-outline-secondary w-100 mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                     <span className="d-flex justify-content-center align-items-center">
                      <span
                        className="spinner-border spinner-custom-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span>Đang xử lý...</span>
                    </span>
                  ) : (
                    <span className="d-flex justify-content-center align-items-center">
                      <img
                        src="/img/icons/google.svg"
                        alt="Google"
                        className="me-2"
                        style={{ width: "20px" }}
                      />
                      <span>Đăng nhập với Google</span>
                    </span>
                  )}
                </button>

                <div className="text-center">
                  <span className="text-dark">Chưa có tài khoản?</span>{" "}
                  <a className="text-primary fw-bold" href="/register">
                    Đăng ký
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <footer className="log-footer">
        <div className="container-fluid">
          <div className="copyright">
            <div className="copyright-text">
              <p>© 2024 FixTech. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LogInPage;
