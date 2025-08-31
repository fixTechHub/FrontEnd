// // ví dụ: src/pages/technician/WarrantyList.jsx
// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchTechWarrantiesThunk } from '../../features/booking-warranty/warrantySlice';
// import Header from '../../components/common/Header';
// import BreadcrumbBar from '../../components/common/BreadcrumbBar';

// export default function WarrantyList() {
//     const dispatch = useDispatch();
//     const { loading, error, items, page, totalPages } = useSelector(s => s.warranty);

//     useEffect(() => {
//         dispatch(fetchTechWarrantiesThunk({ page: 1, limit: 10 }));
//     }, [dispatch]);

//     if (loading) return <div>Đang tải…</div>;
//     if (error) return <div className="text-danger">{error}</div>;

//     return (
//         <div>
//             <Header />

//             <BreadcrumbBar />
//             <ul>
//                 {items.map(w => <li key={w._id}>{w?.bookingId?._id}</li>)}
//             </ul>
//             <button disabled={page <= 1} onClick={() => dispatch(fetchTechWarrantiesThunk({ page: page - 1 }))}>Prev</button>
//             <button disabled={page >= totalPages} onClick={() => dispatch(fetchTechWarrantiesThunk({ page: page + 1 }))}>Next</button>
//         </div>
//     );
// }
