import apiClient from '../../services/apiClient';

// technicianSlice.js (hoặc nơi bạn để thunk)
export const deleteCertificate = createAsyncThunk(
  'technician/deleteCertificate',
  async ({ certificateId }, thunkAPI) => {
    await apiClient.delete(`/certificates/${certificateId}`);
    return certificateId;
  }
);
