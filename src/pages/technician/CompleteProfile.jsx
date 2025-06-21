import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { completeTechnicianProfileThunk } from '../../features/technicians/technicianSlice';

const CompleteProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { loading } = useSelector((state) => state.technician);

    const [formData, setFormData] = useState({
        identification: '',
        specialties: '',
        experienceYears: 0,
        currentLocation: {
            type: 'Point',
            coordinates: [0, 0] // [longitude, latitude]
        },
        bankAccount: {
            bankName: '',
            accountNumber: '',
            accountHolder: '',
            branch: ''
        }
    });

    const [certificates, setCertificates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    useEffect(() => {
        // Kiểm tra xem user có phải là technician không
        if (!user || user.role?.name !== 'TECHNICIAN') {
            navigate('/');
            return;
        }

        // Load categories
        fetchCategories();
        
        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        currentLocation: {
                            type: 'Point',
                            coordinates: [position.coords.longitude, position.coords.latitude]
                        }
                    }));
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast.warning('Không thể lấy vị trí hiện tại. Vui lòng nhập thủ công.');
                }
            );
        }
    }, [user, navigate]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories/public');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    const handleCertificateUpload = (e) => {
        const files = Array.from(e.target.files);
        setCertificates(prev => [...prev, ...files]);
    };

    const removeCertificate = (index) => {
        setCertificates(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.identification.trim()) {
            toast.error('Vui lòng nhập số CMND/CCCD');
            return;
        }

        if (selectedCategories.length === 0) {
            toast.error('Vui lòng chọn ít nhất một chuyên môn');
            return;
        }

        if (certificates.length === 0) {
            toast.error('Vui lòng upload ít nhất một chứng chỉ');
            return;
        }

        try {
            // Upload certificates first
            const uploadedCertificates = [];
            for (const certificate of certificates) {
                const formData = new FormData();
                formData.append('certificate', certificate);
                
                const response = await fetch('/api/technicians/upload/certificate', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });
                
                const data = await response.json();
                if (data.success) {
                    uploadedCertificates.push(data.fileUrl);
                }
            }

            // Complete technician profile
            const technicianData = {
                ...formData,
                specialties: selectedCategories,
                certificate: uploadedCertificates
            };

            await dispatch(completeTechnicianProfileThunk(technicianData)).unwrap();
            
            toast.success('Hoàn thành hồ sơ thành công!');
            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi hoàn thành hồ sơ');
        }
    };

    if (!user || user.role?.name !== 'TECHNICIAN') {
        return null;
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="mb-0">Hoàn thành hồ sơ kỹ thuật viên</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {/* Thông tin cá nhân */}
                                <div className="mb-4">
                                    <h5>Thông tin cá nhân</h5>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Số CMND/CCCD *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="identification"
                                                    value={formData.identification}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Số năm kinh nghiệm</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="experienceYears"
                                                    value={formData.experienceYears}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chuyên môn */}
                                <div className="mb-4">
                                    <h5>Chuyên môn *</h5>
                                    <div className="row">
                                        {categories.map((category) => (
                                            <div key={category._id} className="col-md-4 mb-2">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={category._id}
                                                        checked={selectedCategories.includes(category._id)}
                                                        onChange={() => handleCategoryChange(category._id)}
                                                    />
                                                    <label className="form-check-label" htmlFor={category._id}>
                                                        {category.categoryName}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Chứng chỉ */}
                                <div className="mb-4">
                                    <h5>Chứng chỉ *</h5>
                                    <div className="mb-3">
                                        <input
                                            type="file"
                                            className="form-control"
                                            multiple
                                            accept="image/*,.pdf"
                                            onChange={handleCertificateUpload}
                                        />
                                        <small className="text-muted">
                                            Có thể upload nhiều file (hình ảnh hoặc PDF)
                                        </small>
                                    </div>
                                    {certificates.length > 0 && (
                                        <div className="row">
                                            {certificates.map((cert, index) => (
                                                <div key={index} className="col-md-3 mb-2">
                                                    <div className="card">
                                                        <div className="card-body p-2">
                                                            <small>{cert.name}</small>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-danger ms-2"
                                                                onClick={() => removeCertificate(index)}
                                                            >
                                                                Xóa
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Thông tin ngân hàng */}
                                <div className="mb-4">
                                    <h5>Thông tin ngân hàng</h5>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Tên ngân hàng</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="bankAccount.bankName"
                                                    value={formData.bankAccount.bankName}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Số tài khoản</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="bankAccount.accountNumber"
                                                    value={formData.bankAccount.accountNumber}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Chủ tài khoản</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="bankAccount.accountHolder"
                                                    value={formData.bankAccount.accountHolder}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Chi nhánh</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="bankAccount.branch"
                                                    value={formData.bankAccount.branch}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang xử lý...' : 'Hoàn thành hồ sơ'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile; 