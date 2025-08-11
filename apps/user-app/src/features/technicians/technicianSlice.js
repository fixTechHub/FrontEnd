import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getTechnicianProfile,
  getEarningAndCommission,
  getTechnicianAvailability,
  updateTechnicianAvailability,
  getTechnicianJob,
  getJobDetails,
  getTechnicians, 
  completeTechnicianProfile, 
  fetchCertificatesByTechnicianId, 
  sendQuotationAPI, 
  getTechnicianDepositLogs, 
  getListFeedback, 
  uploadCertificateAPI,
  getScheduleByTechnicianId,
  deleteCertificateAPI
} from '../technicians/technicianAPI';

export const fetchTechnicianProfile = createAsyncThunk(
  'technician/fetchProfile',
  async (technicianId, thunkAPI) => {
    try {
      const data = await getTechnicianProfile(technicianId); // response.data
      console.log('--- FETCH TECHNICIAN PROFILE ---', data); // ✅ sẽ log ra { success, data }
      return data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const fetchEarningAndCommission = createAsyncThunk(
  'technician/fetchEarningAndCommission',
  async (technicianId, thunkAPI) => {
    try {
      const data = await getEarningAndCommission(technicianId);
      console.log(data);
      
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const fetchTechnicians = createAsyncThunk(
  'technician/fetchList',
  async (thunkAPI) => {
    try {
      const data = await getTechnicians();
      return data.data;
    }
    catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message)
    }
  }
)

export const completeTechnicianProfileThunk = createAsyncThunk(
  'technician/completeProfile',
  async (technicianData, thunkAPI) => {
    try {
      const data = await completeTechnicianProfile(technicianData);
      return data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const fetchTechnicianAvailability = createAsyncThunk(
  'technician/fetchAvailability',
  async (technicianId, thunkAPI) => {
    try {
      const availability = await getTechnicianAvailability(technicianId);
      return availability;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const changeTechnicianAvailability = createAsyncThunk(
  'technician/changeAvailability',
  async ({ technicianId, status }, thunkAPI) => {
    try {
      const updated = await updateTechnicianAvailability(technicianId, status);
      return updated;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const sendQuotation = createAsyncThunk(
  'technician/sendQuotation',
  async (formData, thunkAPI) => {
    try {
      const res = await sendQuotationAPI(formData);
      console.log('--- SEND QUOTATION ---', res.data);

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const fetchTechnicianJobDetails = createAsyncThunk(
  'technician/fetchTechnicianJobDetails',
  async ({ technicianId, bookingId }, { rejectWithValue }) => {
    try {
      const data = await getJobDetails(technicianId, bookingId);
      console.log(data);
      return data;

    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchTechnicianJobs = createAsyncThunk(
  'technician/fetchTechnicianJobs',
  async (technicianId, { rejectWithValue }) => {
    try {
      const data = await getTechnicianJob(technicianId);
      console.log(data);
      return data;

    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCertificates = createAsyncThunk(
  'certificates/getCertificates',
  async (technicianId, { rejectWithValue }) => {
    try {
      const data = await fetchCertificatesByTechnicianId(technicianId);
      console.log("data" + data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy chứng chỉ');
    }
  }
);

export const fetchTechnicianDepositLogs = createAsyncThunk(
  'technician/fetchTechnicianDepositLogs',
  async ({ limit, skip }, { rejectWithValue }) => {
    try {
      const response = await getTechnicianDepositLogs({ limit, skip });
      console.log('Data', response.data);
      return response.data.technicianDepositLogs;
    } catch (error) {
      console.error('Thunk Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deposit logs');
    }
  }
);

export const fetchFeedbacks = createAsyncThunk(
  'feedback/fetchFeedbacks',
  async (technicianData, { rejectWithValue }) => {
    try {
      const data = await getListFeedback(technicianData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi khi tải đánh giá'
      );
    }
  }
);

export const uploadCertificate = createAsyncThunk(
  'technician/uploadCertificate',
  async ({ formData, technicianId }, thunkAPI) => {
    try {
      const data = await uploadCertificateAPI(formData, technicianId);
      return data; // trả về { success, message, fileUrl }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Lỗi khi upload chứng chỉ'
      );
    }
  }
);

// export const deleteCertificate = createAsyncThunk(
//   'technician/deleteCertificate',
//   async (certificateId, thunkAPI) => {
//     try {
//       const data = await deleteCertificateAPI(certificateId);
//       return { certificateId, message: data?.message };
//     } catch (err) {
//       return thunkAPI.rejectWithValue(
//         err?.response?.data?.message || 'Delete certificate failed'
//       );
//     }
//   }
// );

export const deleteCertificate = createAsyncThunk(
  'technician/deleteCertificate',
  async ({ certificateId }, thunkAPI) => {              // <-- destructure ở đây
    try {
      // CÁCH 1: dùng API wrapper
      const res = await deleteCertificateAPI(certificateId);
      return { certificateId, ...res };

      // CÁCH 2: gọi thẳng axios nếu muốn
      // const res = await apiClient.delete(`/certificates/${encodeURIComponent(String(certificateId))}`);
      // return { certificateId, ...res.data };
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Delete failed');
    }
  }
);

export const fetchScheduleByTechnicianId = createAsyncThunk(
  'technicianSchedule/fetchByTechnicianId',
  async (technicianId) => {
    const res = await getScheduleByTechnicianId(technicianId);
    return res.data; // Vì API trả về: { success: true, data: schedules }
  }
);

const technicianSlice = createSlice({
  name: 'technician',
  initialState: {
    profile: null,
    earnings: null,
    availability: 'FREE',
    quotations: [],
    loading: false,
    error: null,
    bookings: [],
    jobDetail: null,
    certificates: [],
    logs: [],
    feedbacks: [],
    schedule: [],
    certificateUpload: {
      success: false,
      message: '',
      fileUrl: '',
      loading: false,
      error: null,
     
    },
  },
  reducers: {
  
  },
  extraReducers: (builder) => {
    builder
      //Profile
      .addCase(fetchTechnicianProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchTechnicianProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //earning
      .addCase(fetchEarningAndCommission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEarningAndCommission.fulfilled, (state, action) => {
        state.loading = false;
        state.earnings = action.payload.data;
        console.log('earning: ' + state.earnings)
      })
      .addCase(fetchEarningAndCommission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //Availability
      .addCase(fetchTechnicianAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
        state.error = null;
      })
      .addCase(fetchTechnicianAvailability.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(changeTechnicianAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
        state.error = null;
      })
      .addCase(changeTechnicianAvailability.rejected, (state, action) => {
        state.error = action.payload;
      })

      //Jobs
      .addCase(fetchTechnicianJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data || action.payload.bookings || [];
      })
      .addCase(fetchTechnicianJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bookings';
      })

      //JobDetails
      .addCase(fetchTechnicianJobDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianJobDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.jobDetail = action.payload;
      })
      .addCase(fetchTechnicianJobDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTechnicians.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchTechnicians.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(completeTechnicianProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeTechnicianProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(completeTechnicianProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //certificates
      .addCase(getCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = action.payload;
      })
      .addCase(getCertificates.rejected, (state, action) => {
        state.loading = false;
      })

      // Send Quotation
      .addCase(sendQuotation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendQuotation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.quotations.unshift(action.payload);
      })
      .addCase(sendQuotation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(fetchTechnicianDepositLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianDepositLogs.fulfilled, (state, action) => {
        state.loading = false;

        state.logs = action.payload;
      })
      .addCase(fetchTechnicianDepositLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload;
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(uploadCertificate.pending, (state) => {
        state.certificateUpload.loading = true;
        state.certificateUpload.error = null;
        state.certificateUpload.success = false;
        state.certificateUpload.message = '';
      })
      .addCase(uploadCertificate.fulfilled, (state, action) => {
        state.certificateUpload.loading = false;
        state.certificateUpload.success = true;
        state.certificateUpload.message = action.payload.message;
        state.certificateUpload.fileUrl = action.payload.fileUrl;
      })
      .addCase(uploadCertificate.rejected, (state, action) => {
        state.certificateUpload.loading = false;
        state.certificateUpload.error = action.payload || 'Lỗi không xác định';
      })
      .addCase(fetchScheduleByTechnicianId.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchScheduleByTechnicianId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.schedule = action.payload;
      })
      .addCase(fetchScheduleByTechnicianId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      .addCase(deleteCertificate.pending, (state, action) => {
      state.certificateDeletingId = action.meta.arg; // id đang xóa
    })
    .addCase(deleteCertificate.fulfilled, (state, action) => {
      state.certificateDeletingId = null;
      state.certificates = state.certificates.filter(
        (c) => c._id !== action.payload.certificateId
      );
    })
    .addCase(deleteCertificate.rejected, (state, action) => {
      state.certificateDeletingId = null;
      state.error = action.payload;
    });


  }
});

export default technicianSlice.reducer; 