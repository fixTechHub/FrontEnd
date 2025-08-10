import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { completeTechnicianProfileThunk } from '../../features/technicians/technicianSlice';
import { checkAuthThunk } from '../../features/auth/authSlice';
import { fetchAllPublicCategories } from '../../features/categories/categorySlice';
import apiClient from '../../services/apiClient';
import Tesseract from 'tesseract.js';

const CompleteProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { loading } = useSelector((state) => state.technician);
    const categories = useSelector((state) => state.categories.categories);
    const categoriesStatus = useSelector((state) => state.categories.status);

    const [formData, setFormData] = useState({
        identification: '',
        specialtiesCategories: '',
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
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrError, setOcrError] = useState('');
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);

    useEffect(() => {
        // Kiểm tra xem user có phải là technician không
        if (!user || user.role?.name !== 'TECHNICIAN') {
            navigate('/');
            return;
        }
        dispatch(fetchAllPublicCategories());
    }, [user, navigate, dispatch]);

    // Log kiểm tra dữ liệu categories (riêng)
    useEffect(() => {
        console.log('Categories in CompleteProfile:', categories);
    }, [categories]);

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

      // Kiểm tra bắt buộc phải có chứng chỉ
        // if (certificates.length === 0) {
        //     toast.error('Vui lòng upload ít nhất một chứng chỉ');
        //     return;
        // }

        if (!frontImage || !backImage) {
            toast.error('Vui lòng tải lên cả hai mặt trước và sau của CCCD');
            return;
        }

        try {
            const formDataAll = new FormData();
            // Append files
            formDataAll.append('frontIdImage', frontImage);
            formDataAll.append('backIdImage', backImage);
            certificates.forEach(file => formDataAll.append('certificates', file));

            // Append JSON fields
            formDataAll.append('identification', formData.identification);
            formDataAll.append('experienceYears', formData.experienceYears);
            formDataAll.append('specialtiesCategories', JSON.stringify(selectedCategories));
            formDataAll.append('bankAccount', JSON.stringify(formData.bankAccount));

            // Gọi endpoint duy nhất
            const response = await apiClient.post('/technicians/complete-profile', formDataAll, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Refresh auth & điều hướng
            await dispatch(checkAuthThunk());
            toast.success('Hoàn thành hồ sơ thành công! Hồ sơ đang chờ admin phê duyệt.');
            navigate('/', { replace: true });
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
                            <form>
                                {/* Thông tin cá nhân */}
                                <div className="mb-4">
                                    <h5>Thông tin cá nhân</h5>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Số CCCD *</label>
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
                                        {categories && categories.length > 0 ? categories.map((category) => (
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
                                        )) : <div className="col-12">Không có dữ liệu chuyên môn</div>}
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

                                <div className="col-md-6 mb-2">
                                    <label>Mặt trước CCCD *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-control"
                                        onChange={e => setFrontImage(e.target.files[0])}
                                        required
                                    />
                                    {frontImage && (
                                        <>
                                            <img
                                                src={URL.createObjectURL(frontImage)}
                                                alt="Mặt trước CCCD"
                                                style={{ width: 180, marginTop: 8, border: '1px solid #ccc' }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-success mt-2"
                                                onClick={async () => {
                                                    setOcrLoading(true);
                                                    setOcrError('');
                                                    try {
                                                        const { data: { text } } = await Tesseract.recognize(
                                                            frontImage,
                                                            'eng+vie'
                                                        );
                                                        const match = text.match(/\b\d{9}\b|\b\d{12}\b/);
                                                        if (match) {
                                                            setFormData(prev => ({ ...prev, identification: match[0] }));
                                                        } else {
                                                            setOcrError('Không nhận diện được số CCCD trong ảnh!');
                                                        }
                                                    } catch (err) {
                                                        setOcrError('Có lỗi khi nhận diện ảnh!');
                                                    }
                                                    setOcrLoading(false);
                                                }}
                                                disabled={ocrLoading}
                                            >
                                                {ocrLoading ? 'Đang nhận diện...' : 'Nhận diện số CCCD từ ảnh'}
                                            </button>
                                            {ocrError && <div className="text-danger">{ocrError}</div>}
                                        </>
                                    )}
                                </div>

                                <div className="col-md-6 mb-2">
                                    <label>Mặt sau CCCD *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-control"
                                        onChange={e => setBackImage(e.target.files[0])}
                                        required
                                    />
                                    {backImage && (
                                        <img
                                            src={URL.createObjectURL(backImage)}
                                            alt="Mặt sau CCCD"
                                            style={{ width: 180, marginTop: 8, border: '1px solid #ccc' }}
                                        />
                                    )}
                                </div>

                                <div className="d-grid gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary w-100 btn-size"
                                        onClick={handleSubmit}
                                        disabled={loading || !selectedCategories.length || !formData.identification || !certificates.length}
                                    >
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>ĐANG HOÀN TẤT...</>
                                        ) : 'HOÀN TẤT HỒ SƠ'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}


export default CompleteProfile; 
