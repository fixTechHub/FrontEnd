import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTechnicianProfile } from '../../features/technicians/technicianSlice';
import { useParams } from 'react-router-dom';
import Header from '../../components/common/Header';

function ViewTechnicianProfile() {
    const dispatch = useDispatch();
    const { id } = useParams();

    const { profile, loading, error } = useSelector(state => state.technician);

    useEffect(() => {
        if (id) {
            dispatch(fetchTechnicianProfile(id));
        }
    }, [dispatch, id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!profile) return <p>No profile data.</p>;

    const user = profile.userId ?? {};  // fallback nếu userId chưa có
    const specialties = profile.specialtiesCategories ?? [];

    return (
        <>
            <Header />
            <div>
                <div className="settings-info" >
                    <div className="settings-sub-heading">
                        <h4>Profile</h4>
                    </div>

                    <div className="profile-info-grid">
                        <div className="profile-info-header">
                            <h5>Basic Information</h5>
                            <p>Information about user</p>
                        </div>
                        <div className="profile-inner">
                            <div className="profile-info-pic">
                                <div className="profile-info-img">
                                    <img src={user?.avatar} alt="avatar" style={{ width: 150, borderRadius: '50%' }} />
                                    <div className="profile-edit-info">
                                        <a href="javascript:void(0)">
                                            <i className="feather-edit"></i>
                                        </a>
                                        <a href="javascript:void(0)">
                                            <i className="feather-trash-2"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="profile-info-content">
                                    <h6>Profile picture</h6>
                                    <p>PNG, JPEG under 15 MB</p>
                                </div>
                            </div>
                            <div >
                                <div className="col-md-6">
                                    <div className="profile-form-group">
                                        <label>Full Name: {user?.fullName}</label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="profile-form-group">
                                        <label>Phone Number: {user?.phone}</label>

                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="profile-form-group">
                                        <label>Email: {user?.email}</label>

                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="profile-form-group">
                                        <label>Address: {user?.address?.street}, {user?.address?.district}, {user?.address?.city}</label>

                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="profile-form-group">
                                        <label>Kinh nghiệm:  {profile?.experienceYears} năm</label>

                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="profile-form-group">
                                        <label>Đánh giá trung bình: {profile?.ratingAverage}</label>

                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="profile-form-group">
                                        <label>Chuyên môn:
                                            <ul>
                                                {specialties.map((spec) => (
                                                    <li key={spec._id}>{spec.categoryName}</li>
                                                ))}
                                            </ul></label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewTechnicianProfile;
