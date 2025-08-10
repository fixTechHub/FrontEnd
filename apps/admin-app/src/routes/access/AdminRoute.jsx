import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import ApiBE from "../../services/ApiBE";

const AdminRoute = ({ children }) => {
  // Nếu dự án không có auth slice, state.auth sẽ là undefined
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});
  const [checking, setChecking] = useState(!isAuthenticated);
  const [authOk, setAuthOk] = useState(Boolean(isAuthenticated));
  const [resolvedUser, setResolvedUser] = useState(user || null);

  useEffect(() => {
    // Nếu chưa có isAuthenticated, verify qua /auth/me (dựa trên HttpOnly cookie)
    const check = async () => {
      if (isAuthenticated) {
        setAuthOk(true);
        return;
      }
      setChecking(true);
      try {
        const res = await ApiBE.get('auth/me', { withCredentials: true });
        setResolvedUser(res?.data || null);
        setAuthOk(true);
      } catch (e) {
        setAuthOk(false);
      } finally {
        setChecking(false);
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authOk && !checking) {
    return <Navigate to="/login" replace />;
  }

  // Tùy vào cấu trúc user, kiểm tra role admin nếu có
  const effectiveUser = resolvedUser || user;
  const roleRaw = effectiveUser?.roleName || effectiveUser?.role?.name || effectiveUser?.role || "";
  const roleName = (typeof roleRaw === 'string' ? roleRaw : '').toUpperCase();
  if (roleName && roleName !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // Trong lúc checking, tránh render redirect để không bị đá ra login sớm
  if (checking) return null;

  return children;
};

export default AdminRoute;
