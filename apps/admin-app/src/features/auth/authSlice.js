import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authAPI, { requestDeleteVerificationAPI, verifyDeleteOTPAPI, deleteAccountAPI } from "./authAPI";
import { toast } from "react-toastify";

// Initial state
const initialState = {
  user: null,
  technician: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  verificationStatus: {
    step: null,
    redirectTo: null,
    message: null,
  },
  profile: null,
  profileLoading: false,
  profileError: null,
  updateLoading: false,
  updateError: null,
  // New state for staged registration
  registrationData: {
    fullName: '',
    emailOrPhone: '',
    password: '',
    role: '',
  },
  registrationToken: null, // Thêm token để lưu JWT
};

// Async thunks
export const checkAuthThunk = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const result = await authAPI.checkAuth();
      
      // Nếu không có authentication, trả về null thay vì throw error
      if (!result) {
        return null;
      }
      
      // Kiểm tra nếu tài khoản bị vô hiệu hóa bởi admin
      if (result.user && result.user.status === 'INACTIVE_ADMIN') {
        // Đăng xuất người dùng và hiển thị thông báo
        toast.error("Tài khoản của bạn đã bị vô hiệu hóa bởi quản trị viên. Vui lòng liên hệ với quản trị viên để được hỗ trợ.");
        // Có thể dispatch logout action ở đây nếu cần
        throw new Error("Tài khoản bị vô hiệu hóa bởi quản trị viên");
      }
      
      // Kiểm tra nếu tài khoản đang trong trạng thái chờ xóa
      if (result.user && result.user.status === 'PENDING_DELETION') {
        // Khôi phục tài khoản tự động
        toast.success("Tài khoản của bạn đã được khôi phục thành công!");
      }
      
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authAPI.login(credentials);
      
      if (result.wasReactivated) {
        sessionStorage.setItem("wasReactivated", "true");
        toast.success("Chào mừng trở lại! Tài khoản của bạn đã được kích hoạt lại.");
      } else if (result.user && result.user.status === 'PENDING_DELETION') {
        toast.success("Tài khoản của bạn đã được khôi phục thành công! Việc xóa tài khoản đã được hủy bỏ.");
      } else {
        toast.success("Đăng nhập thành công!");
      }
      
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const googleLoginThunk = createAsyncThunk(
  "auth/googleLogin",
  async (accessToken, { rejectWithValue }) => {
    try {
      const result = await authAPI.googleLogin(accessToken);
      
      // Kiểm tra nếu tài khoản vừa được kích hoạt lại
      if (result.wasReactivated) {
        // Lưu thông tin vào sessionStorage để HomePage có thể sử dụng
        sessionStorage.setItem("wasReactivated", "true");
        toast.success("Chào mừng trở lại! Tài khoản của bạn đã được kích hoạt lại.");
      } else if (result.user && result.user.status === 'PENDING_DELETION') {
        // Khôi phục tài khoản tự động
        toast.success("Tài khoản của bạn đã được khôi phục thành công!");
      } else {
        toast.success("Đăng nhập thành công!");
      }
      
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New Thunk for final, staged registration
export const finalizeRegistrationThunk = createAsyncThunk(
  "auth/finalizeRegistration",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { registrationData } = getState().auth;
      // Basic validation before sending
      if (!registrationData.emailOrPhone || !registrationData.password || !registrationData.role) {
        return rejectWithValue("Thông tin đăng ký không đầy đủ.");
      }
      const result = await authAPI.finalizeRegistration(registrationData);
      
      // Nếu cần xác thực email, trả về thông tin để chuyển hướng
      if (result.requiresVerification) {
        return {
          requiresVerification: true,
          message: result.message,
          registrationToken: result.registrationToken // Lưu token từ response
        };
      }
      
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyEmailThunk = createAsyncThunk(
  "auth/verifyEmail",
  async (code, { getState, rejectWithValue }) => {
    try {
      const { registrationToken } = getState().auth;
      return await authAPI.verifyEmail(code, registrationToken);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOTPThunk = createAsyncThunk(
  "auth/verifyOTP",
  async (otp, { rejectWithValue }) => {
    try {
      return await authAPI.verifyOTP(otp);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendEmailCodeThunk = createAsyncThunk(
  "auth/resendEmailCode",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { registrationToken } = getState().auth;
      const result = await authAPI.resendEmailCode(registrationToken);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendOTPThunk = createAsyncThunk(
  "auth/resendOTP",
  async (_, { rejectWithValue }) => {
    try {
      return await authAPI.resendOTP();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkExistThunk = createAsyncThunk(
  "auth/checkExist",
  async (emailOrPhone, { rejectWithValue }) => {
    try {
      return await authAPI.checkExist(emailOrPhone);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await authAPI.logout();
      // Clear verification status ngay sau khi logout
      dispatch(clearVerificationStatus());
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProfileThunk = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const response = await authAPI.getUserProfile();
      
      // Kiểm tra nếu có thông báo khôi phục tài khoản
      if (response.message && response.message.includes('khôi phục')) {
        toast.success(response.message);
      }
      
      // Kiểm tra data trả về
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy thông tin người dùng";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (userData, thunkAPI) => {
    try {
      const response = await authAPI.updateUserProfile(userData);
      // Tạm thời comment out để test
      // await thunkAPI.dispatch(checkAuthThunk());
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật thông tin";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const updateAvatarThunk = createAsyncThunk(
  "auth/updateAvatar",
  async (formData, thunkAPI) => {
    try {
      const response = await authAPI.updateAvatar(formData);
      // Tạm thời comment out để test
      // await thunkAPI.dispatch(checkAuthThunk());
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật ảnh đại diện";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, thunkAPI) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể đổi mật khẩu";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const deactivateAccountThunk = createAsyncThunk(
  "auth/deactivateAccount",
  async (password, thunkAPI) => {
    try {
      const response = await authAPI.deactivateAccount(password);
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể vô hiệu hóa tài khoản";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const requestDeactivateVerificationThunk = createAsyncThunk(
  "auth/requestDeactivateVerification",
  async (verificationMethod, thunkAPI) => {
    try {
      const response = await authAPI.requestDeactivateVerification(verificationMethod);
      toast.success(response.message);
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể gửi mã xác thực";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const verifyDeactivateAccountThunk = createAsyncThunk(
  "auth/verifyDeactivateAccount",
  async (otp, thunkAPI) => {
    try {
      const response = await authAPI.verifyDeactivateAccount(otp);
      toast.success("Tài khoản đã được vô hiệu hóa thành công. Bạn sẽ được đăng xuất.");
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể vô hiệu hóa tài khoản";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Delete Account Thunks
export const requestDeleteVerificationThunk = createAsyncThunk(
  'auth/requestDeleteVerification',
  async (method, { rejectWithValue }) => {
    try {
      const response = await requestDeleteVerificationAPI(method);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const verifyDeleteOTPThunk = createAsyncThunk(
  'auth/verifyDeleteOTP',
  async (otp, { rejectWithValue }) => {
    try {
      const response = await verifyDeleteOTPAPI(otp);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteAccountThunk = createAsyncThunk(
  'auth/deleteAccount',
  async ({ password, confirmText }, { rejectWithValue }) => {
    try {
      const response = await deleteAccountAPI(password, confirmText);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const requestPhoneChangeThunk = createAsyncThunk(
  "auth/requestPhoneChange",
  async (newPhone, { rejectWithValue }) => {
    try {
      await authAPI.requestPhoneChange(newPhone);
      return { newPhone };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Không thể gửi yêu cầu. Vui lòng thử lại.";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const verifyPhoneChangeThunk = createAsyncThunk(
  "auth/verifyPhoneChange",
  async ({ otp, newPhone }, { dispatch, rejectWithValue }) => {
    try {
      const response = await authAPI.verifyPhoneChange(otp, newPhone);
      await dispatch(checkAuthThunk());
      return response;
    } catch (error) {
      const msg = error.response?.data?.message || "Mã OTP không hợp lệ.";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Thêm helper function để xác định verification status
const determineVerificationStatus = (user) => {
  if (!user) return null;

  // Kiểm tra email verification trước
  if (user.email && !user.emailVerified) {
    return {
      step: "VERIFY_EMAIL",
      redirectTo: "/verify-email",
      message: "Vui lòng xác thực email của bạn",
    };
  }

  // Kiểm tra phone verification (chỉ khi không có email)
  if (user.phone && !user.phoneVerified && !user.email) {
    return {
      step: "VERIFY_PHONE",
      redirectTo: "/verify-otp",
      message: "Vui lòng xác thực số điện thoại của bạn",
    };
  }

  // Kiểm tra technician profile completion (sau khi đã xác thực email/phone)
  if (user.role?.name === 'TECHNICIAN') {
    // Nếu chưa có technician profile, cần hoàn thành hồ sơ
    if (!user.technician) {
      return {
        step: "COMPLETE_PROFILE",
        redirectTo: "/technician/complete-profile",
        message: "Vui lòng hoàn thành hồ sơ của bạn",
      };
    }
  }

  return {
    step: "COMPLETED",
    redirectTo: null,
    message: null,
  };
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // New reducers for staged registration
    updateRegistrationData: (state, action) => {
      state.registrationData = {
        ...state.registrationData,
        ...action.payload,
      };
    },
    clearRegistrationData: (state) => {
      state.registrationData = initialState.registrationData;
    },
    // Action to manually set loading state, useful for direct API calls without thunks
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Action to handle successful registration/login from a direct API call
    authSuccess: (state, action) => {
      const { user, verificationStatus } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      // Sử dụng verificationStatus từ backend nếu có, nếu không thì tính toán
      state.verificationStatus = verificationStatus || determineVerificationStatus(user);
    },
    clearVerificationStatus: (state) => {
      state.verificationStatus = {
        step: null,
        redirectTo: null,
        message: null,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    setVerificationStatus: (state, action) => {
      state.verificationStatus = action.payload;
    },
    updateUserState: (state, action) => {
      state.user = action.payload;
      state.verificationStatus = determineVerificationStatus(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuthThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.loading = false;
        
        // Nếu payload là null, có nghĩa là không có authentication
        if (!action.payload) {
          state.isAuthenticated = false;
          state.user = null;
          state.technician = null;
          state.verificationStatus = null;
          return;
        }
        
        // Nếu có payload, set authentication như bình thường
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.technician = action.payload.technician;
        state.verificationStatus = determineVerificationStatus(
          action.payload.user
        );
      })
      .addCase(checkAuthThunk.rejected, (state, action) => {
        // Chỉ cập nhật state và reset nếu người dùng đang ở trạng thái đăng nhập
        // Điều này ngăn vòng lặp vô hạn khi tải ứng dụng lúc chưa đăng nhập
        if (state.isAuthenticated) {
          state.isAuthenticated = false;
          state.user = null;
          state.technician = null;
          state.verificationStatus = null;
          state.error = action.payload;
        }
        state.loading = false; // Luôn set loading về false
      })
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        // Sử dụng verificationStatus từ backend nếu có, nếu không thì tính toán
        state.verificationStatus = action.payload.verificationStatus || determineVerificationStatus(
          action.payload.user
        );
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Google Login
      .addCase(googleLoginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        // Sử dụng verificationStatus từ backend nếu có, nếu không thì tính toán
        state.verificationStatus = action.payload.verificationStatus || determineVerificationStatus(
          action.payload.user
        );
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register (This is now the final step)
      .addCase(finalizeRegistrationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(finalizeRegistrationThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        // Nếu cần xác thực email, lưu token và không set user
        if (action.payload.requiresVerification) {
          state.registrationToken = action.payload.registrationToken; // Lưu token
          return;
        }
        
        // Nếu có user data (từ verifyEmail), set như bình thường
        if (action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.verificationStatus = action.payload.verificationStatus || determineVerificationStatus(
            action.payload.user
          );
          // Clear token sau khi đăng ký thành công
          state.registrationToken = null;
        }
      })
      .addCase(finalizeRegistrationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Email
      .addCase(verifyEmailThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        // Sử dụng verificationStatus từ backend nếu có, nếu không thì tính toán
        state.verificationStatus = action.payload.verificationStatus || determineVerificationStatus(
          action.payload.user
        );
      })
      .addCase(verifyEmailThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOTPThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTPThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true; // Đảm bảo user được authenticated
        // Sử dụng verificationStatus từ backend nếu có, nếu không thì tính toán
        state.verificationStatus = action.payload.verificationStatus || determineVerificationStatus(
          action.payload.user
        );
      })
      .addCase(verifyOTPThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Resend Email Code
      .addCase(resendEmailCodeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendEmailCodeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Cập nhật token mới nếu có
        if (action.payload.registrationToken) {
          state.registrationToken = action.payload.registrationToken;
        }
      })
      .addCase(resendEmailCodeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.technician = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.verificationStatus = {
          step: null,
          redirectTo: null,
          message: null,
        };
        state.profile = null;
        state.profileLoading = false;
        state.profileError = null;
        state.updateLoading = false;
        state.updateError = null;
        state.registrationToken = null; // Clear registration token
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Vẫn reset state ngay cả khi logout thất bại
        state.user = null;
        state.technician = null;
        state.isAuthenticated = false;
        state.verificationStatus = null;
      })
      // Profile cases
      .addCase(fetchUserProfileThunk.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfileThunk.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(fetchUserProfileThunk.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
        toast.error(action.payload || "Không thể lấy thông tin người dùng");
      })
      // Update Profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Cập nhật cả user và profile với dữ liệu mới
        const updatedData = action.payload;
        state.user = updatedData;
        if (state.profile) {
          state.profile = {
            ...state.profile,
            fullName: updatedData.fullName,
            phone: updatedData.phone,
            address: updatedData.address,
          };
        }
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Update Avatar
      .addCase(updateAvatarThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateAvatarThunk.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Cập nhật avatar trong cả user và profile
        const updatedData = action.payload;
        if (updatedData.avatar) {
          state.user = {
            ...state.user,
            avatar: updatedData.avatar,
          };
          if (state.profile) {
            state.profile = {
              ...state.profile,
              avatar: updatedData.avatar,
            };
          }
        }
      })
      .addCase(updateAvatarThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Change Password
      .addCase(changePasswordThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.updateLoading = false;
        state.updateError = null;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Deactivate account
      .addCase(deactivateAccountThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(deactivateAccountThunk.fulfilled, (state) => {
        state.updateLoading = false;
        // The logoutThunk will handle clearing the state
      })
      .addCase(deactivateAccountThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Delete account
      .addCase(deleteAccountThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(deleteAccountThunk.fulfilled, (state) => {
        state.updateLoading = false;
        // Reset state sau khi xóa tài khoản thành công
        state.user = null;
        state.technician = null;
        state.isAuthenticated = false;
        state.verificationStatus = null;
        state.profile = null;
      })
      .addCase(deleteAccountThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Request Delete Verification
      .addCase(requestDeleteVerificationThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(requestDeleteVerificationThunk.fulfilled, (state) => {
        state.updateLoading = false;
        state.updateError = null;
      })
      .addCase(requestDeleteVerificationThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Verify Delete OTP
      .addCase(verifyDeleteOTPThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(verifyDeleteOTPThunk.fulfilled, (state) => {
        state.updateLoading = false;
        state.updateError = null;
      })
      .addCase(verifyDeleteOTPThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Phone Change
      .addCase(requestPhoneChangeThunk.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(requestPhoneChangeThunk.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(requestPhoneChangeThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      .addCase(verifyPhoneChangeThunk.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(verifyPhoneChangeThunk.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.user = action.payload.user;
      })
      .addCase(verifyPhoneChangeThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Check Exist
      .addCase(checkExistThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkExistThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(checkExistThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateRegistrationData,
  clearRegistrationData,
  authSuccess,
  setAuthLoading,
  clearError,
  clearVerificationStatus,
  setVerificationStatus,
  updateUserState,
} = authSlice.actions;

export default authSlice.reducer;
