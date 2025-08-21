// features/auth/bootstrap.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import {     
  fetchTechnicianAvailability,
  fetchTechnicianJobs,
  fetchEarningAndCommission,
} from '../technicians/technicianSlice';

export const postLoginBootstrap = createAsyncThunk(
  'auth/postLoginBootstrap',
  async (_, { dispatch, getState }) => {
    // 1) đảm bảo có user
    const me = (await dispatch(fetchMe()).unwrap?.()) || getState().auth.user;
    const userId = me?._id;

    // 2) lấy technicianId
    // let techId = getState().auth?.technician?._id;
    // if (!techId && userId) {
    //   const tech = await dispatch(fetchTechnicianByUserId(userId)).unwrap();
    //   techId = tech?._id;
    // }

    // 3) preload dữ liệu dashboard
    if (techId) {
      await Promise.all([
        dispatch(fetchTechnicianAvailability(techId)),
        dispatch(fetchTechnicianJobs(techId)),
        dispatch(fetchEarningAndCommission(techId)),
      ]);
    }
    return techId;
  }
);
