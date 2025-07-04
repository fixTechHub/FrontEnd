// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchTechnicianProfile } from '../../features/technician/technicianSlice';
// import { useParams } from 'react-router-dom';
// import Rating from 'react-rating';

// function ViewTechnicianProfile() {
//     const dispatch = useDispatch();
//     const { technicianId } = useParams();

//     const { profile, loading, error } = useSelector(state => state.technician);
//     console.log("Profile:", profile);

//     useEffect(() => {
//     if (technicianId) {
//         console.log("Dispatching technicianId:", technicianId);
//         dispatch(fetchTechnicianProfile(technicianId));
//     } else {
//         console.log("No technicianId available");
//     }
// }, [dispatch, technicianId]);

//     if (loading) return <p>Loading...</p>;
//     if (error) return <p style={{ color: 'red' }}>{error}</p>;
//     if (!profile) return <p>No profile data.</p>;

//     const technician = profile.technician;
//     const certificates = profile.certificates;

//     const user = technician.userId ?? {};  // fallback nếu userId chưa có
//     const specialties = technician.specialtiesCategories ?? [];

//     return (
//         <>
           
//             <div>
//                 <div className="settings-info" >
//                     <div className="settings-sub-heading">
//                         <h4>Profile</h4>
//                     </div>

//                     <div className="profile-info-grid">
//                         <div className="profile-info-header">
//                             <h5>Basic Information</h5>
//                             <p>Information about technician</p>
//                         </div>
//                         <div className="profile-inner">
//                             <div className="profile-info-pic">
//                                 <div className="profile-info-img">
//                                     <img src={user?.avatar} alt="avatar" style={{ width: 150, borderRadius: '50%' }} />
//                                     <div className="profile-edit-info">
//                                         <a href="javascript:void(0)">
//                                             <i className="feather-edit"></i>
//                                         </a>
//                                         <a href="javascript:void(0)">
//                                             <i className="feather-trash-2"></i>
//                                         </a>
//                                     </div>
//                                 </div>

//                             </div>
//                             <div >
//                                 <div className="col-md-6">
//                                     <div className="profile-form-group">
//                                         <label>Full Name: {user?.fullName}</label>
//                                     </div>
//                                 </div>
//                                 <div className="col-md-6">
//                                     <div className="profile-form-group">
//                                         <label>Phone Number: {user?.phone}</label>

//                                     </div>
//                                 </div>
//                                 <div className="col-md-6">
//                                     <div className="profile-form-group">
//                                         <label>Email: {user?.email}</label>

//                                     </div>
//                                 </div>
//                                 <div className="col-md-6">
//                                     <div className="profile-form-group">
//                                         <label>Address: {user?.address?.street}, {user?.address?.district}, {user?.address?.city}</label>

//                                     </div>
//                                 </div>
//                                 <div className="col-md-6">
//                                     <div className="profile-form-group">
//                                         <label>Kinh nghiệm:  {technician?.experienceYears} năm</label>

//                                     </div>
//                                 </div>
//                                 <div className="col-md-6">
//                                     <div className="profile-form-group " style={{ display: 'flex' }}>
//                                         <div>
//                                             <label>Đánh giá:</label>
//                                         </div>

//                                         <div className="review-rating">
//                                             <Rating
//                                                 initialRating={technician?.ratingAverage}
//                                                 readonly
//                                                 fullSymbol={<i className="fas fa-star filled"></i>}
//                                                 emptySymbol={<i className="far fa-star"></i>}
//                                             />
//                                             <span>({technician?.ratingAverage})</span>
//                                         </div>


//                                     </div>
//                                 </div>
//                                 <div className="col-md-6">
//                                     <div className="profile-form-group">
//                                         <label>Chuyên môn:
//                                             <ul>
//                                                 {specialties.map((spec) => (
//                                                     <li key={spec._id}>{spec.categoryName}</li>
//                                                 ))}
//                                             </ul></label>
//                                     </div>
//                                 </div>
//                                 <div className="col-md-12">
//                                     <div className="profile-form-group">
//                                         <label>Chứng chỉ:</label>
//                                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
//                                             {certificates.map((cert) => (
//                                                 <div key={cert._id} style={{ textAlign: 'center' }}>
//                                                     <img
//                                                         src={cert.fileUrl}
//                                                         alt="certificate"
//                                                         style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 10, border: '1px solid #ccc' }}
//                                                     />

//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default ViewTechnicianProfile;
