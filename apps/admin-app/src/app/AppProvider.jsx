import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
import store from './store';
import { checkAuthThunk } from '../features/auth/authSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Chỉ check auth nếu có token trong localStorage
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.log('Không có token, bỏ qua auth check');
      return;
    }

    // Tự động kiểm tra authentication khi app khởi động
    const checkAuth = async () => {
      try {
        const result = await dispatch(checkAuthThunk()).unwrap();
        // Nếu result là null, có nghĩa là không có authentication
        if (!result) {
          console.log('Không có authentication, user cần đăng nhập');
        }
      } catch (error) {
        // Chỉ log error nếu không phải là network error
        if (error && !error.includes('Network Error') && !error.includes('ERR_CONNECTION_REFUSED')) {
          console.log('Auth check failed:', error);
        } else {
          console.log('NodeJS không khả dụng, chuyển sang .NET backend');
        }
        // Không throw error để app vẫn chạy được
      }
    };
    
    checkAuth();
  }, [dispatch]);

  return children;
};

const AppProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  );
};

export default AppProvider;