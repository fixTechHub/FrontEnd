import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getAllPackages,
    createPackage,
    updatePackage,
    deletePackage,
    togglePackage
} from "./packageAPI";

// 📌 Lấy tất cả gói dịch vụ
export const fetchAllPackages = createAsyncThunk(
    'adminPackages/fetchAll',
    async () => {
        const res = await getAllPackages();
        return res.data.data;
    }
);

// 📌 Tạo gói dịch vụ mới
export const createNewPackage = createAsyncThunk(
    'adminPackages/create',
    async (payload) => {
        const res = await createPackage(payload);
        return res.data.data;
    }
);

// 📌 Cập nhật gói
// export const editPackage = createAsyncThunk(
//     'adminPackages/update',
//     async ({payload }) => {
//         const res = await updatePackage(payload);
//         return res.data.data;
//     }
// );

// export const editPackage = createAsyncThunk(
//     'adminPackages/update',
//     async (payload) => {
//         const { id, ...updateData } = payload;  // tách id ra khỏi dữ liệu
//         const res = await updatePackage(id, updateData); // GỌI API ĐÚNG: /packages/:id
//         return res.data.data;
//     }
// );

export const editPackage = createAsyncThunk(
  'adminPackages/update',
  async (payload) => {
    console.log("📦 editPackage payload nhận được:", payload);

    const id = payload.id;   // 🚀 lấy trực tiếp, không destructuring
    const updateData = { ...payload }; 
    delete updateData.id;

    console.log("📦 id truyền cho API:", id);
    const res = await updatePackage(id, updateData);
    return res.data.data;
  }
);

// 📌 Xóa gói
export const removePackage = createAsyncThunk(
    'adminPackages/delete',
    async (id) => {
        await deletePackage(id);
        return id;
    }
);

// 📌 Bật/Tắt gói
export const togglePackageStatus = createAsyncThunk(
    'adminPackages/toggle',
    async (id) => {
        const res = await togglePackage(id);
        return res.data.data;
    }
);

const adminPackageSlice = createSlice({
    name: 'adminPackages',
    initialState: {
        packages: [],
        status: 'idle',
        error: null,
        deletedPackages: [], 
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // 📌 GET ALL PACKAGES
            .addCase(fetchAllPackages.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllPackages.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.packages = action.payload;
            })
            .addCase(fetchAllPackages.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            // 📌 CREATE PACKAGE
            .addCase(createNewPackage.fulfilled, (state, action) => {
                state.packages.push(action.payload);
            })

            // 📌 UPDATE PACKAGE
            .addCase(editPackage.fulfilled, (state, action) => {
                const index = state.packages.findIndex(pkg => pkg._id === action.payload._id);
                if (index !== -1) {
                    state.packages[index] = action.payload;
                }
            })

            // 📌 DELETE PACKAGE
            .addCase(removePackage.fulfilled, (state, action) => {
                state.packages = state.packages.filter(pkg => pkg._id !== action.payload);
            })

            // 📌 TOGGLE PACKAGE
            .addCase(togglePackageStatus.fulfilled, (state, action) => {
                const index = state.packages.findIndex(pkg => pkg._id === action.payload._id);
                if (index !== -1) {
                    state.packages[index] = action.payload;
                }
            });
    }
});

export default adminPackageSlice.reducer;