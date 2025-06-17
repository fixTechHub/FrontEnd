import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAPI from './authAPI';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  technician: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  verificationStatus: null,
  profile: null,
  profileLoading: false,
  profileError: null,
  updateLoading: false,
  updateError: null,
};

// Async thunks
export const checkAuthThunk = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      return await authAPI.checkAuth();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authAPI.login(credentials);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const googleLoginThunk = createAsyncThunk(
  'auth/googleLogin',
  async (accessToken, { rejectWithValue }) => {
    try {
      return await authAPI.googleLogin(accessToken);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      return await authAPI.register(userData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeRegistrationThunk = createAsyncThunk(
  'auth/completeRegistration',
  async (role, { rejectWithValue }) => {
    try {
      return await authAPI.completeRegistration(role);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyEmailThunk = createAsyncThunk(
  'auth/verifyEmail',
  async (code, { rejectWithValue }) => {
    try {
      return await authAPI.verifyEmail(code);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOTPThunk = createAsyncThunk(
  'auth/verifyOTP',
  async (otp, { rejectWithValue }) => {
    try {
      return await authAPI.verifyOTP(otp);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendEmailCodeThunk = createAsyncThunk(
  'auth/resendEmailCode',
  async (_, { rejectWithValue }) => {
    try {
      return await authAPI.resendEmailCode();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendOTPThunk = createAsyncThunk(
  'auth/resendOTP',
  async (_, { rejectWithValue }) => {
    try {
      return await authAPI.resendOTP();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProfileThunk = createAsyncThunk(
  'auth/fetchProfile',
  async (_, thunkAPI) => {
    try {
      const response = await authAPI.getUserProfile();
      // Kiểm tra data trả
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy thông tin người dùng';
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const  updateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const response = await authAPI.updateUserProfile(userData);
      toast.success('Cập nhật thông tin thành công');
      await thunkAPI.dispatch(checkAuthThunk());
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật thông tin';
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const updateAvatarThunk = createAsyncThunk(
  'auth/updateAvatar',
  async (formData, thunkAPI) => {
    try {
      const response = await authAPI.updateAvatar(formData);
      toast.success('Cập nhật ảnh đại diện thành công');
      await thunkAPI.dispatch(checkAuthThunk());
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật ảnh đại diện';
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setVerificationStatus: (state, action) => {
      state.verificationStatus = action.payload;
    },
    clearVerificationStatus: (state) => {
      state.verificationStatus = null;
    }
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
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.technician = action.payload.technician;
      })
      .addCase(checkAuthThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.technician = action.payload.technician;
        state.verificationStatus = action.payload.verificationStatus;
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
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.technician = action.payload.technician;
        state.verificationStatus = action.payload.verificationStatus;
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Complete Registration
      .addCase(completeRegistrationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeRegistrationThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(completeRegistrationThunk.rejected, (state, action) => {
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
      })
      .addCase(verifyOTPThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.technician = null;
        state.verificationStatus = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        toast.error(action.payload || 'Không thể lấy thông tin người dùng');
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
        state.user = updatedData
        if (state.profile) {
          state.profile = {
            ...state.profile,
            fullName: updatedData.fullName,
            phone: updatedData.phone,
            address: updatedData.address
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
            avatar: updatedData.avatar
          };
          if (state.profile) {
            state.profile = {
              ...state.profile,
              avatar: updatedData.avatar
            };
          }
        }
      })
      .addCase(updateAvatarThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  }
});

export const { clearError, setVerificationStatus, clearVerificationStatus } = authSlice.actions;
export default authSlice.reducer;
