import { createSlice } from '@reduxjs/toolkit';

const quotationSlice = createSlice({
    name: 'quotation',
    initialState: {
        items: [],
        laborPrice: '',
        warrantiesDuration: 30,
        loading: false,
        error: null
    },
    reducers: {
        addItem: (state, action) => {
            state.items.push(action.payload);
        },
        removeItem: (state, action) => {
            state.items.splice(action.payload, 1);
        },
        updateItem: (state, action) => {
            const { index, item } = action.payload;
            state.items[index] = item;
        },
        setLaborPrice: (state, action) => {
            state.laborPrice = action.payload;
        },
        setWarrantiesDuration: (state, action) => {
            state.warrantiesDuration = action.payload;
        },
        clearQuotation: (state) => {
            state.items = [];
            state.laborPrice = '';
            state.warrantiesDuration = 30;
            state.error = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    addItem,
    removeItem,
    updateItem,
    setLaborPrice,
    setWarrantiesDuration,
    clearQuotation,
    setLoading,
    setError
} = quotationSlice.actions;

export default quotationSlice.reducer;
