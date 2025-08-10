import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { completeTechnicianProfileThunk } from '../../features/technicians/technicianSlice';
import { checkAuthThunk } from '../../features/auth/authSlice';
import { fetchAllPublicCategories } from '../../features/categories/categorySlice';
import { fetchAllPublicServices } from '../../features/services/serviceSlice';
import ImageDropZone from '../../components/common/ImageDropZone';
import apiClient from '../../services/apiClient';

const CompleteProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { loading } = useSelector((state) => state.technician);
    const categories = useSelector((state) => state.categories.categories);
    const services = useSelector((state) => state.services.services);

    const [formData, setFormData] = useState({
        identification: '',
        specialtiesCategories: '',
        experienceYears: 0,
        currentLocation: {
            type: 'Point',
            coordinates: [0, 0]
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
    const [serviceDetails, setServiceDetails] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [inspectionFee, setInspectionFee] = useState('');
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    
    // Personal info states
    const [identification, setIdentification] = useState('');
    const [experienceYears, setExperienceYears] = useState('');
    const [currentStep, setCurrentStep] = useState(1); // Track current step
    const [cccdErrors, setCccdErrors] = useState('');

    // helper validation
    const isServiceDetailsValid = Object.keys(serviceDetails).length > 0 &&
        Object.values(serviceDetails).every(d => Number(d.price) > 0 && Number(d.warranty) >= 0);
    
    // Step validation
    const isStep1Valid = identification.length > 0 && !cccdErrors && Number(experienceYears) > 0 && frontImage && backImage;
    const isStep2Valid = selectedCategories.length > 0 && isServiceDetailsValid;
    const isStep3Valid = formData.bankAccount.bankName && formData.bankAccount.accountNumber && 
                        formData.bankAccount.accountHolder;
    const isAllStepsValid = isStep1Valid && isStep2Valid && isStep3Valid;

    useEffect(() => {
        if (!user || user.role?.name !== 'TECHNICIAN') {
            navigate('/');
            return;
        }
        dispatch(fetchAllPublicCategories());
        dispatch(fetchAllPublicServices());
    }, [user, navigate, dispatch]);

    // CCCD Validation function
    const validateCCCD = (cccdNumber) => {
        // Remove all non-digit characters
        const cleanNumber = cccdNumber.replace(/\D/g, '');
        
        if (cleanNumber.length === 0) {
            return 'Vui lòng nhập số CCCD';
        }
        
        if (cleanNumber.length !== 12) {
            return 'Số CCCD phải có đúng 12 chữ số';
        }
        
        // Check if it's not all same digits
        if (/^(\d)\1{11}$/.test(cleanNumber)) {
            return 'Số CCCD không hợp lệ (không được toàn bộ cùng 1 số)';
        }
        
        // Check for common invalid patterns
        const invalidPatterns = [
            '123456789012', // Sequential fake number
            '000000000000', // All zeros
            '111111111111', // All ones
            '123456789123', // Another common fake
            '987654321098'  // Reverse sequential
        ];
        
        if (invalidPatterns.includes(cleanNumber)) {
            return 'Số CCCD không hợp lệ (số giả mạo)';
        }
        
        // Basic structure validation for Vietnamese CCCD
        // First 3 digits: location code (001-096)
        // 046: Đà Nẵng (valid code)
        const locationCode = cleanNumber.substring(0, 3);
        const locationCodeNum = parseInt(locationCode);
        if (locationCodeNum < 1 || locationCodeNum > 96) {
            return 'Mã tỉnh/thành phố không hợp lệ (001-096)';
        }
        
        // Digits 4-5: gender and century 
        // 20: Nam sinh thế kỷ 21 (2000-2099)
        const genderCentury = cleanNumber.substring(3, 5);
        const genderCenturyNum = parseInt(genderCentury);
        if (genderCenturyNum < 0 || genderCenturyNum > 99) {
            return 'Mã giới tính/thế kỷ không hợp lệ';
        }
        
        // Last 6 digits: sequential number (000001-999999)
        const sequentialNumber = cleanNumber.substring(6, 12);
        const sequentialNum = parseInt(sequentialNumber);
        if (sequentialNum < 1 || sequentialNum > 999999) {
            return 'Số thứ tự không hợp lệ';
        }
        
        return '';
    };

    // Handle CCCD input change
    const handleCCCDChange = (value) => {
        // Format CCCD with spaces for better readability
        const cleanValue = value.replace(/\D/g, '');
        const formattedValue = cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4').trim();
        
        setIdentification(formattedValue);
        const error = validateCCCD(cleanValue);
        setCccdErrors(error);
    };

    // Handle OCR result from CCCD images
    const handleOCRResult = (result) => {
        if (result && result.cccdNumber) {
            const detectedNumber = result.cccdNumber;
            handleCCCDChange(detectedNumber);
            toast.success(`🎯 Đã nhận diện số CCCD: ${detectedNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')}`);
        } else {
            toast.error('❌ Không thể nhận diện số CCCD từ ảnh. Vui lòng nhập thủ công.');
        }
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories(prevSelected => {
            let updatedSelected;
            if (prevSelected.includes(categoryId)) {
                updatedSelected = prevSelected.filter(id => id !== categoryId);
                
                // Nếu bỏ category → xoá mọi service thuộc category đó
                setServiceDetails(prevDetails => {
                    let newDetails = { ...prevDetails };
                    const servicesOfCat = services.filter(s => s.categoryId === categoryId);
                    servicesOfCat.forEach(svc => {
                        delete newDetails[svc._id];
                    });
                    return newDetails;
                });
                
                // Clear errors cho services của category này
                setFieldErrors(prevErrs => {
                    let newErrs = { ...prevErrs };
                    const servicesOfCat = services.filter(s => s.categoryId === categoryId);
                    servicesOfCat.forEach(svc => {
                        delete newErrs[`${svc._id}-price`];
                        delete newErrs[`${svc._id}-warranty`];
                    });
                    return newErrs;
                });
            } else {
                updatedSelected = [...prevSelected, categoryId];
            }

            return updatedSelected;
        });
    };

    const handleServiceDetailChange = (serviceId, field, value) => {
        setServiceDetails(prev => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId],
                [field]: value
            }
        }));

        // validate immediately
        setFieldErrors(prevErrs => {
            const newErrs = { ...prevErrs };
            const priceVal = field === 'price' ? Number(value) : Number(serviceDetails[serviceId]?.price || 0);
            const warrVal = field === 'warranty' ? Number(value) : Number(serviceDetails[serviceId]?.warranty || 0);
            if (priceVal <= 0 || isNaN(priceVal)) {
                newErrs[`${serviceId}-price`] = 'Giá phải > 0';
            } else {
                delete newErrs[`${serviceId}-price`];
            }
            if (warrVal < 0 || isNaN(warrVal)) {
                newErrs[`${serviceId}-warranty`] = 'Bảo hành ≥ 0';
            } else {
                delete newErrs[`${serviceId}-warranty`];
            }
            return newErrs;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedCategories.length === 0) {
            toast.error('Vui lòng chọn ít nhất một chuyên môn');
            return;
        }

        // validate service details
        if (!isServiceDetailsValid) {
            toast.error('Vui lòng nhập giá > 0 và bảo hành ≥ 0 cho tất cả dịch vụ');
            return;
        }
        // Removed inspection fee validation

        try {
            const formDataAll = new FormData();
            
            // Append real form data
            formDataAll.append('identification', identification);
            formDataAll.append('experienceYears', experienceYears);
            formDataAll.append('specialtiesCategories', JSON.stringify(selectedCategories));
            formDataAll.append('bankAccount', JSON.stringify(formData.bankAccount));
            formDataAll.append('serviceDetails', JSON.stringify(serviceDetails));
            // Removed inspectionFee

            // Append image files
            if (frontImage) {
                formDataAll.append('frontIdImage', frontImage);
            }
            if (backImage) {
                formDataAll.append('backIdImage', backImage);
            }

            // Append certificates
            certificates.forEach((cert, index) => {
                formDataAll.append('certificates', cert);
            });

            console.log('🚀 Submitting real data to API...');
            
            // Call the Redux thunk to submit to backend
            const result = await dispatch(completeTechnicianProfileThunk(formDataAll));
            
            if (completeTechnicianProfileThunk.fulfilled.match(result)) {
                toast.success('✅ Hồ sơ đã được hoàn thành thành công!');
                // Refresh user data and technician profile
                await dispatch(checkAuthThunk());
                // Wait a bit for the user data to be updated, then navigate
                setTimeout(() => {
                    navigate('/profile');
                }, 500);
            } else {
                throw new Error(result.payload?.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('❌ Submit error:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi hoàn thành hồ sơ');
        }
    };

    if (!user || user.role?.name !== 'TECHNICIAN') {
        return null;
    }

    return (
        <>
            <style jsx>{`
                .wizard-container {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 2rem 0;
                    position: relative;
                }
                .wizard-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    overflow: hidden;
                }
                .sidebar {
                    background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
                    border-right: 1px solid rgba(148, 163, 184, 0.2);
                }
                @media (max-width: 767px) {
                    .sidebar {
                        display: none;
                    }
                    .wizard-card {
                        margin: 1rem 0.5rem;
                    }
                    .wizard-container {
                        padding: 1rem 0;
                    }
                }
                .step-item {
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 0.5rem;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .step-item:hover {
                    background: rgba(102, 126, 234, 0.1);
                    transform: translateX(4px);
                }
                .step-active {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                }
                .step-completed {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }
                .chip {
                    display: inline-flex;
                    align-items: center;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin: 4px;
                }
                .chip-unselected {
                    background: #f1f5f9;
                    color: #64748b;
                    border: 2px solid #e2e8f0;
                }
                .chip-unselected:hover {
                    background: #e2e8f0;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .chip-selected {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
                }
                .service-chip {
                    background: white;
                    border: 2px solid #e5e7eb;
                    color: #374151;
                    margin: 4px;
                    padding: 8px 16px;
                    border-radius: 16px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                }
                .service-chip:hover {
                    border-color: #667eea;
                    background: rgba(102, 126, 234, 0.05);
                }
                .service-chip-selected {
                    background: #10b981;
                    border-color: #10b981;
                    color: white;
                    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
                }

                .input-group-modern .form-control {
                    border: 2px solid #e5e7eb;
                    padding: 12px 16px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                .input-group-modern .form-control:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                    z-index: 3;
                }
                .input-group-modern .input-group-text {
                    border: 2px solid #e5e7eb;
                    background: #f8f9fa;
                    color: #6c757d;
                    font-weight: 500;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                .input-group-modern .input-group-text:first-child {
                    border-radius: 12px 0 0 12px;
                    border-right: none;
                }
                .input-group-modern .input-group-text:last-child {
                    border-radius: 0 12px 12px 0;
                    border-left: none;
                    background: #667eea;
                    color: white;
                    font-weight: 600;
                }
                .input-group-modern .form-control:focus + .input-group-text:last-child,
                .input-group-modern:focus-within .input-group-text:last-child {
                    border-color: #667eea;
                }
                .input-group-modern:focus-within .input-group-text:first-child {
                    border-color: #667eea;
                    background: rgba(102, 126, 234, 0.1);
                    color: #667eea;
                }
            `}</style>
            <div className="wizard-container">
                <div className="container-fluid">
            <div className="row justify-content-center">
                        <div className="col-11 col-xl-10">
                            <div className="wizard-card">
                                <div className="row g-0">
                                    {/* Sidebar */}
                                    <div className="col-md-4 col-lg-3">
                                        <div className="sidebar p-4">
                                            <div className="text-center mb-4">
                                                <h5 className="fw-bold text-dark mb-1">Hoàn thành hồ sơ</h5>
                                                <small className="text-muted">Kỹ thuật viên</small>
                                            </div>
                                            
                                            <nav>
                                                <div 
                                                    className={`step-item ${currentStep === 1 ? 'step-active' : isStep1Valid ? 'step-completed' : ''}`}
                                                    onClick={() => setCurrentStep(1)}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle bg-white me-3" style={{
                                                            width: '32px', 
                                                            height: '32px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            color: isStep1Valid ? '#10b981' : currentStep === 1 ? '#667eea' : '#6b7280'
                                                        }}>
                                                            {isStep1Valid ? (
                                                                <i className="bi bi-check-lg fw-bold"></i>
                                                            ) : (
                                                                <span className="fw-bold">1</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="fw-semibold">Thông tin cá nhân</div>
                                                            <small className="opacity-75">CCCD & Kinh nghiệm</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div 
                                                    className={`step-item ${currentStep === 2 ? 'step-active' : isStep2Valid ? 'step-completed' : ''}`}
                                                    onClick={() => setCurrentStep(2)}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle bg-white me-3" style={{
                                                            width: '32px', 
                                                            height: '32px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            color: isStep2Valid ? '#10b981' : currentStep === 2 ? '#667eea' : '#6b7280'
                                                        }}>
                                                            {isStep2Valid ? (
                                                                <i className="bi bi-check-lg fw-bold"></i>
                                                            ) : (
                                                                <span className="fw-bold">2</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="fw-semibold">Dịch vụ & Giá cả</div>
                                                            <small className="opacity-75">Chọn & định giá</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div 
                                                    className={`step-item ${currentStep === 3 ? 'step-active' : isStep3Valid ? 'step-completed' : ''}`}
                                                    onClick={() => setCurrentStep(3)}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle bg-white me-3" style={{
                                                            width: '32px', 
                                                            height: '32px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            color: isStep3Valid ? '#10b981' : currentStep === 3 ? '#667eea' : '#6b7280'
                                                        }}>
                                                            {isStep3Valid ? (
                                                                <i className="bi bi-check-lg fw-bold"></i>
                                                            ) : (
                                                                <span className="fw-bold">3</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="fw-semibold">Thanh toán</div>
                                                            <small className="opacity-75">Ngân hàng & Phí</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div 
                                                    className={`step-item ${currentStep === 4 ? 'step-active' : ''}`}
                                                    onClick={() => isAllStepsValid && setCurrentStep(4)}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle bg-white me-3" style={{
                                                            width: '32px', 
                                                            height: '32px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            color: currentStep === 4 ? '#667eea' : '#6b7280'
                                                        }}>
                                                            <span className="fw-bold">4</span>
                                                        </div>
                                                        <div>
                                                            <div className="fw-semibold">Xem lại & Hoàn tất</div>
                                                            <small className="opacity-75">Chứng chỉ & Xác nhận</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </nav>
                                        </div>
                        </div>
                                    
                                    {/* Main Content */}
                                    <div className="col-md-8 col-lg-9">
                                        <div className="p-4">
                                            {/* Step 1: Personal Information */}
                                            {currentStep === 1 && (
                                                <>
                                <div className="mb-4">
                                                        <h4 className="fw-bold text-dark mb-2">Thông tin cá nhân</h4>
                                                        <p className="text-muted">Nhập thông tin CCCD và kinh nghiệm làm việc</p>
                                                    </div>

                                                    {/* CCCD Upload */}
                                                    <div className="mb-5">
                                                        <h6 className="fw-semibold mb-3">
                                                            Căn cước công dân (CCCD)
                                                            <span className="ms-2 badge bg-info">
                                                                <i className="bi bi-magic me-1"></i>
                                                                Tự động nhận diện
                                                            </span>
                                                        </h6>
                                                        <div className="row g-4">
                                                            <div className="col-md-6">
                                                                <ImageDropZone
                                                                    label="Mặt trước CCCD"
                                                                    currentFile={frontImage}
                                                                    onFileSelect={setFrontImage}
                                                                    onRemove={() => setFrontImage(null)}
                                                                    onOCRResult={handleOCRResult}
                                                                    accept="image/*"
                                                                    maxSize={10 * 1024 * 1024} // 10MB
                                                                />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <ImageDropZone
                                                                    label="Mặt sau CCCD"
                                                                    currentFile={backImage}
                                                                    onFileSelect={setBackImage}
                                                                    onRemove={() => setBackImage(null)}
                                                                    accept="image/*"
                                                                    maxSize={10 * 1024 * 1024} // 10MB
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Personal Details */}
                                                    <div className="mb-5">
                                                        <h6 className="fw-semibold mb-3">Thông tin cá nhân</h6>
                                                        <div className="row g-4">
                                        <div className="col-md-6">
                                                                <label className="form-label fw-medium">
                                                                    Số CCCD
                                                                    <span className="text-danger ms-1">*</span>
                                                                </label>
                                                                <div className="input-group input-group-modern">
                                                                    <span className="input-group-text">
                                                                        <i className="bi bi-credit-card-2-front"></i>
                                                                    </span>
                                                <input
                                                    type="text"
                                                                        className={`form-control ${
                                                                            identification.length > 0 && !cccdErrors 
                                                                                ? 'is-valid' 
                                                                                : cccdErrors 
                                                                                    ? 'is-invalid' 
                                                                                    : ''
                                                                        }`}
                                                                        placeholder="XXX XXX XXX XXX"
                                                                        value={identification}  
                                                                        onChange={(e) => handleCCCDChange(e.target.value)}
                                                                        maxLength="15" // 12 digits + 3 spaces
                                                />
                                            </div>
                                                                {cccdErrors && (
                                                                    <div className="invalid-feedback d-block">{cccdErrors}</div>
                                                                )}
                                                                {identification.length > 0 && !cccdErrors && (
                                                                    <div className="valid-feedback d-block">
                                                                        <i className="bi bi-check-circle me-1"></i>
                                                                        Số CCCD hợp lệ
                                                                    </div>
                                                                )}
                                        </div>
                                        <div className="col-md-6">
                                                                <label className="form-label fw-medium">
                                                                    Số năm kinh nghiệm
                                                                    <span className="text-danger ms-1">*</span>
                                                                </label>
                                                                <div className="input-group input-group-modern">
                                                                    <span className="input-group-text">
                                                                        <i className="bi bi-award"></i>
                                                                    </span>
                                                <input
                                                    type="number"
                                                                        className={`form-control ${experienceYears > 0 ? 'is-valid' : 'is-invalid'}`}
                                                                        placeholder="Nhập số năm"
                                                                        value={experienceYears || ''}
                                                                        onChange={(e) => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
                                                    min="0"
                                                                        max="50"
                                                                    />
                                                                    <span className="input-group-text">năm</span>
                                                                </div>
                                                                {(experienceYears === '' || experienceYears <= 0) && (
                                                                    <div className="invalid-feedback d-block">Vui lòng nhập số năm kinh nghiệm</div>
                                                                )}
                                                                {experienceYears > 0 && (
                                                                    <div className="valid-feedback d-block">
                                                                        <i className="bi bi-check-circle me-1"></i>
                                                                        {experienceYears} năm kinh nghiệm
                                            </div>
                                                                )}
                                        </div>
                                    </div>
                                </div>

                                                    {/* Next Button */}
                                                    <div className="d-flex justify-content-end">
                                                        <button 
                                                            className="btn btn-primary btn-lg px-4"
                                                            onClick={() => isStep1Valid && setCurrentStep(2)}
                                                            disabled={!isStep1Valid}
                                                        >
                                                            Tiếp tục <i className="bi bi-arrow-right ms-2"></i>
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            {/* Step 2: Services & Pricing */}
                                            {currentStep === 2 && (
                                                <>
                                <div className="mb-4">
                                                        <h4 className="fw-bold text-dark mb-2">Dịch vụ & Giá cả</h4>
                                                        <p className="text-muted">Chọn lĩnh vực chuyên môn và các dịch vụ bạn có thể thực hiện</p>
                                                    </div>

                                            {/* Chọn chuyên môn */}
                                            <div className="mb-5">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="fw-semibold mb-0">Lĩnh vực chuyên môn</h6>
                                                    {selectedCategories.length === 0 && (
                                                        <small className="text-danger">
                                                            <i className="bi bi-exclamation-triangle me-1"></i>
                                                            Chọn ít nhất 1 lĩnh vực
                                                        </small>
                                                    )}
                                                </div>
                                                <div className="d-flex flex-wrap">
                                        {categories && categories.length > 0 ? categories.map((category) => (
                                                        <span
                                                            key={category._id}
                                                            className={`chip ${
                                                                selectedCategories.includes(category._id) 
                                                                    ? 'chip-selected' 
                                                                    : 'chip-unselected'
                                                            }`}
                                                            onClick={() => handleCategoryChange(category._id)}
                                                        >
                                                            <i className="bi bi-gear me-2"></i>
                                                        {category.categoryName}
                                                            {selectedCategories.includes(category._id) && (
                                                                <i className="bi bi-check-lg ms-2"></i>
                                                            )}
                                                        </span>
                                                    )) : (
                                                        <div className="text-muted">Đang tải dữ liệu...</div>
                                                    )}
                                                </div>
                                                {selectedCategories.length > 0 && (
                                                    <div className="mt-2">
                                                        <small className="text-success">
                                                            <i className="bi bi-check-circle me-1"></i>
                                                            Đã chọn {selectedCategories.length} lĩnh vực
                                                        </small>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Step 2: Chọn dịch vụ cụ thể */}
                                            {selectedCategories.length > 0 && (
                                                <div className="mb-5">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h6 className="fw-semibold mb-0">Dịch vụ cung cấp</h6>
                                                        {Object.keys(serviceDetails).length === 0 && (
                                                            <small className="text-warning">
                                                                <i className="bi bi-info-circle me-1"></i>
                                                                Chọn dịch vụ bạn thực hiện
                                                            </small>
                                                        )}
                                                    </div>
                                                    {selectedCategories.map(catId => {
                                                        const cat = categories.find(c => c._id === catId);
                                                        const servicesOfCat = services.filter(s => s.categoryId === catId);
                                                        return (
                                                            <div key={catId} className="mb-4">
                                                                <div className="d-flex align-items-center mb-3">
                                                                    <i className="bi bi-gear-wide-connected text-primary me-2"></i>
                                                                    <span className="fw-medium text-dark me-2">{cat?.categoryName}</span>
                                                                    <span className="badge bg-light text-muted">{servicesOfCat.length}</span>
                                                                </div>
                                                                <div className="d-flex flex-wrap">
                                                                    {servicesOfCat.map(svc => (
                                                                        <span
                                                                            key={svc._id}
                                                                            className={`service-chip ${
                                                                                serviceDetails[svc._id] 
                                                                                    ? 'service-chip-selected' 
                                                                                    : ''
                                                                            }`}
                                                                            onClick={() => {
                                                                                if (serviceDetails[svc._id]) {
                                                                                    // Remove service
                                                                                    setServiceDetails(prev => {
                                                                                        const newDetails = { ...prev };
                                                                                        delete newDetails[svc._id];
                                                                                        return newDetails;
                                                                                    });
                                                                                    // Clear errors
                                                                                    setFieldErrors(prev => {
                                                                                        const newErrs = { ...prev };
                                                                                        delete newErrs[`${svc._id}-price`];
                                                                                        delete newErrs[`${svc._id}-warranty`];
                                                                                        return newErrs;
                                                                                    });
                                                                                } else {
                                                                                    // Add service
                                                                                    setServiceDetails(prev => ({
                                                                                        ...prev,
                                                                                        [svc._id]: { price: '', warranty: '' }
                                                                                    }));
                                                                                }
                                                                            }}
                                                                        >
                                                                            {serviceDetails[svc._id] ? (
                                                                                <i className="bi bi-check-circle-fill me-2 text-success"></i>
                                                                            ) : (
                                                                                <i className="bi bi-plus-circle me-2 text-primary"></i>
                                                                            )}
                                                                            {svc.serviceName}
                                                                        </span>
                                                                    ))}
                                    </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Step 3: Thiết lập giá */}
                                            {Object.keys(serviceDetails).length > 0 && (
                                                <div className="mb-5">
                                                    <h6 className="fw-semibold mb-3">Thiết lập giá & bảo hành</h6>
                                                    <div className="row g-3">
                                                        {Object.keys(serviceDetails).map(serviceId => {
                                                            const svc = services.find(s => s._id === serviceId);
                                                            return (
                                                                <div key={serviceId} className="col-lg-6">
                                                                    <div className="card border-0 bg-light">
                                                                        <div className="card-body p-3">
                                                                            <div className="d-flex align-items-center mb-3">
                                                                                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                                                                    <i className="bi bi-check-circle-fill text-success" style={{fontSize: '16px'}}></i>
                                                                                </div>
                                                                                <h6 className="mb-0 fw-medium">{svc?.serviceName}</h6>
                                </div>

                                                                            <div className="row g-2">
                                                                                <div className="col-6">
                                                                                    <label className="form-label small fw-medium">Giá dịch vụ</label>
                                                                                    <div className="input-group input-group-modern">
                                                                                        <input
                                                                                            type="number"
                                                                                            className={`form-control ${
                                                                                                fieldErrors[`${serviceId}-price`] ? 'is-invalid' : ''
                                                                                            }`}
                                                                                            placeholder="0"
                                                                                            value={serviceDetails[serviceId]?.price || ''}
                                                                                            onChange={e => handleServiceDetailChange(serviceId, 'price', e.target.value)}
                                                                                            min="0"
                                                                                        />
                                                                                        <span className="input-group-text">VNĐ</span>
                                                                                    </div>
                                                                                    {fieldErrors[`${serviceId}-price`] && (
                                                                                        <small className="text-danger">{fieldErrors[`${serviceId}-price`]}</small>
                                                                                    )}
                                                                                </div>
                                                                                <div className="col-6">
                                                                                    <label className="form-label small fw-medium">Bảo hành</label>
                                                                                    <div className="input-group input-group-modern">
                                        <input
                                                                                            type="number"
                                                                                            className={`form-control ${
                                                                                                fieldErrors[`${serviceId}-warranty`] ? 'is-invalid' : ''
                                                                                            }`}
                                                                                            placeholder="0"
                                                                                            value={serviceDetails[serviceId]?.warranty || ''}
                                                                                            onChange={e => handleServiceDetailChange(serviceId, 'warranty', e.target.value)}
                                                                                            min="0"
                                                                                        />
                                                                                        <span className="input-group-text">tháng</span>
                                                                                    </div>
                                                                                    {fieldErrors[`${serviceId}-warranty`] && (
                                                                                        <small className="text-danger">{fieldErrors[`${serviceId}-warranty`]}</small>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                    </div>
                                                        </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                                    
                                                    {/* Navigation Buttons */}
                                                    <div className="d-flex justify-content-between">
                                                        <button 
                                                            className="btn btn-outline-secondary btn-lg px-4"
                                                            onClick={() => setCurrentStep(1)}
                                                        >
                                                            <i className="bi bi-arrow-left me-2"></i> Quay lại
                                                        </button>
                                                        <button 
                                                            className="btn btn-primary btn-lg px-4"
                                                            onClick={() => isStep2Valid && setCurrentStep(3)}
                                                            disabled={!isStep2Valid}
                                                        >
                                                            Tiếp tục <i className="bi bi-arrow-right ms-2"></i>
                                                        </button>
                                        </div>
                                                </>
                                            )}
                                            
                                            {/* Step 3: Bank & Payment */}
                                            {currentStep === 3 && (
                                                <>
                                                    <div className="mb-4">
                                                        <h4 className="fw-bold text-dark mb-2">Thông tin thanh toán</h4>
                                                        <p className="text-muted">Thiết lập thông tin ngân hàng và phí dịch vụ</p>
                                </div>

                                                    {/* Bank Information */}
                                                    <div className="mb-5">
                                                        <h6 className="fw-semibold mb-3">Thông tin ngân hàng</h6>
                                                        <div className="row g-3">
                                        <div className="col-md-6">
                                                <label className="form-label">Tên ngân hàng</label>
                                                <input
                                                    type="text"
                                                                    className={`form-control ${formData.bankAccount.bankName ? 'is-valid' : 'is-invalid'}`}
                                                                    placeholder="Ví dụ: Vietcombank"
                                                    value={formData.bankAccount.bankName}
                                                                    onChange={(e) => setFormData(prev => ({
                                                                        ...prev,
                                                                        bankAccount: { ...prev.bankAccount, bankName: e.target.value }
                                                                    }))}
                                                />
                                                                {!formData.bankAccount.bankName && (
                                                                    <div className="invalid-feedback">Vui lòng nhập tên ngân hàng</div>
                                                                )}
                                        </div>
                                        <div className="col-md-6">
                                                <label className="form-label">Số tài khoản</label>
                                                <input
                                                    type="text"
                                                                    className={`form-control ${formData.bankAccount.accountNumber ? 'is-valid' : 'is-invalid'}`}
                                                                    placeholder="Nhập số tài khoản"
                                                    value={formData.bankAccount.accountNumber}
                                                                    onChange={(e) => setFormData(prev => ({
                                                                        ...prev,
                                                                        bankAccount: { ...prev.bankAccount, accountNumber: e.target.value }
                                                                    }))}
                                                />
                                                                {!formData.bankAccount.accountNumber && (
                                                                    <div className="invalid-feedback">Vui lòng nhập số tài khoản</div>
                                                                )}
                                        </div>
                                        <div className="col-md-6">
                                                <label className="form-label">Chủ tài khoản</label>
                                                <input
                                                    type="text"
                                                                    className={`form-control ${formData.bankAccount.accountHolder ? 'is-valid' : 'is-invalid'}`}
                                                                    placeholder="Họ và tên chủ tài khoản viết hoa không dấu"
                                                    value={formData.bankAccount.accountHolder}
                                                                    onChange={(e) => setFormData(prev => ({
                                                                        ...prev,
                                                                        bankAccount: { ...prev.bankAccount, accountHolder: e.target.value }
                                                                    }))}
                                                />
                                                                {!formData.bankAccount.accountHolder && (
                                                                    <div className="invalid-feedback">Vui lòng nhập tên chủ tài khoản</div>
                                                                )}
                                        </div>
                                        <div className="col-md-6">
                                                <label className="form-label">Chi nhánh</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                                    placeholder="Chi nhánh (không bắt buộc)"
                                                    value={formData.bankAccount.branch}
                                                                    onChange={(e) => setFormData(prev => ({
                                                                        ...prev,
                                                                        bankAccount: { ...prev.bankAccount, branch: e.target.value }
                                                                    }))}
                                                />
                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Inspection Fee - removed */}
                                                    {false && (
                                                    <div className="mb-5">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <h6 className="fw-semibold mb-0">Phí kiểm tra</h6>
                                                            {inspectionFee <= 0 && (
                                                                <small className="text-danger">
                                                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                                                    Phí phải &gt; 0
                                                                </small>
                                                            )}
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="input-group input-group-modern">
                                                                <input
                                                                    type="number"
                                                                    className={`form-control ${(inspectionFee === '' || inspectionFee <= 0) ? 'is-invalid' : 'is-valid'}`}
                                                                    placeholder="Nhập phí kiểm tra"
                                                                    value={inspectionFee || ''}
                                                                    onChange={e => setInspectionFee(e.target.value === '' ? '' : Number(e.target.value))}
                                                                    min="0"
                                                                />
                                                                <span className="input-group-text">VNĐ</span>
                                                            </div>
                                                            <div className="form-text">
                                                                {inspectionFee > 0 ? (
                                                                    <span className="text-success">
                                                                        <i className="bi bi-check-circle me-1"></i>
                                                                        Phí kiểm tra: {inspectionFee.toLocaleString('vi-VN')} VNĐ
                                                                    </span>
                                                                ) : (
                                                                    "Phí kiểm tra ban đầu trước khi báo giá chi tiết"
                                                                )}
                                        </div>
                                    </div>
                                </div>
                                )}

                                                    {/* Navigation Buttons */}
                                                    <div className="d-flex justify-content-between">
                                                        <button 
                                                            className="btn btn-outline-secondary btn-lg px-4"
                                                            onClick={() => setCurrentStep(2)}
                                                        >
                                                            <i className="bi bi-arrow-left me-2"></i> Quay lại
                                                        </button>
                                            <button
                                                            className="btn btn-primary btn-lg px-4"
                                                            onClick={() => isStep3Valid && setCurrentStep(4)}
                                                            disabled={!isStep3Valid}
                                                        >
                                                            Xem lại <i className="bi bi-arrow-right ms-2"></i>
                                            </button>
                                                    </div>
                                        </>
                                    )}
                                            
                                            {/* Step 4: Review & Submit */}
                                            {currentStep === 4 && (
                                                <>
                                                    <div className="mb-4">
                                                        <h4 className="fw-bold text-dark mb-2">Xem lại thông tin</h4>
                                                        <p className="text-muted">Kiểm tra lại thông tin trước khi hoàn thành</p>
                                                    </div>
                                                    
                                                    {/* Summary Cards */}
                                                    <div className="row g-4 mb-5">
                                                        {/* Personal Info Summary */}
                                                        <div className="col-md-6">
                                                            <div className="card border-0 bg-light h-100">
                                                                <div className="card-body">
                                                                    <div className="d-flex align-items-center mb-3">
                                                                        <i className="bi bi-person-circle text-primary me-2 fs-5"></i>
                                                                        <h6 className="mb-0 fw-semibold">Thông tin cá nhân</h6>
                                                                    </div>
                                                                    <div className="small">
                                                                        <div className="mb-2">
                                                                            <strong>CCCD:</strong> {identification || 'Chưa nhập'}
                                                                        </div>
                                                                        <div className="mb-2">
                                                                            <strong>Kinh nghiệm:</strong> {experienceYears || 0} năm
                                                                        </div>
                                                                        <div>
                                                                            <strong>Hình ảnh CCCD:</strong> {frontImage && backImage ? '✅ Đã upload' : '❌ Chưa upload'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Services Summary */}
                                                        <div className="col-md-6">
                                                            <div className="card border-0 bg-light h-100">
                                                                <div className="card-body">
                                                                    <div className="d-flex align-items-center mb-3">
                                                                        <i className="bi bi-tools text-success me-2 fs-5"></i>
                                                                        <h6 className="mb-0 fw-semibold">Dịch vụ & Giá cả</h6>
                                                                    </div>
                                                                    <div className="small">
                                                                        <div className="mb-2">
                                                                            <strong>Chuyên môn:</strong> {selectedCategories.length} lĩnh vực
                                                                        </div>
                                                                        <div className="mb-2">
                                                                            <strong>Dịch vụ:</strong> {Object.keys(serviceDetails).length} dịch vụ
                                                                        </div>

                                                                        {Object.keys(serviceDetails).length > 0 && (
                                                                            <div className="mt-2 pt-2 border-top">
                                                                                <small className="text-muted d-block mb-1">Chi tiết dịch vụ:</small>
                                                                                {Object.entries(serviceDetails).map(([serviceId, detail]) => {
                                                                                    const svc = services.find(s => s._id === serviceId);
                                                                                    return (
                                                                                        <div key={serviceId} className="d-flex justify-content-between align-items-center mb-1">
                                                                                            <small className="text-truncate me-2">{svc?.serviceName}</small>
                                                                                            <small className="text-success fw-medium">
                                                                                                {Number(detail.price) > 0 
                                                                                                    ? Number(detail.price).toLocaleString('vi-VN') + ' VNĐ' 
                                                                                                    : 'Chưa nhập'
                                                                                                }
                                                                                            </small>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Bank Info Summary */}
                                                        <div className="col-md-6">
                                                            <div className="card border-0 bg-light h-100">
                                                                <div className="card-body">
                                                                    <div className="d-flex align-items-center mb-3">
                                                                        <i className="bi bi-bank text-warning me-2 fs-5"></i>
                                                                        <h6 className="mb-0 fw-semibold">Thông tin ngân hàng</h6>
                                                                    </div>
                                                                    <div className="small">
                                                                        <div className="mb-2">
                                                                            <strong>Ngân hàng:</strong> {formData.bankAccount.bankName}
                                                                        </div>
                                                                        <div className="mb-2">
                                                                            <strong>STK:</strong> {formData.bankAccount.accountNumber}
                                                                        </div>
                                                                        <div>
                                                                            <strong>Chủ TK:</strong> {formData.bankAccount.accountHolder}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                </div>

                                                        {/* Fee Summary - removed */}
                                                        {false && (
                                                        <div className="col-md-6">
                                                            <div className="card border-0 bg-light h-100">
                                                                <div className="card-body">
                                                                    <div className="d-flex align-items-center mb-3">
                                                                        <i className="bi bi-cash-coin text-info me-2 fs-5"></i>
                                                                        <h6 className="mb-0 fw-semibold">Phí dịch vụ</h6>
                                                                    </div>
                                                                    <div className="small">
                                                                        <div className="mb-2">
                                                                            <strong>Phí kiểm tra:</strong> {inspectionFee && Number(inspectionFee) > 0 
                                                                                ? Number(inspectionFee).toLocaleString('vi-VN') + ' VNĐ' 
                                                                                : 'Chưa nhập'
                                                                            }
                                                                        </div>
                                                                        <div>
                                                                            <strong>Tổng dịch vụ:</strong> {Object.keys(serviceDetails).length} dịch vụ
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        )}
                                                    </div>

                                                    {/* Certificate Upload (Optional) */}
                                                    <div className="mb-5">
                                                        <div className="card border-0 bg-light">
                                                            <div className="card-body">
                                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                                    <div className="d-flex align-items-center">
                                                                        <i className="bi bi-award text-secondary me-2 fs-5"></i>
                                                                        <h6 className="mb-0 fw-semibold">Chứng chỉ (Tùy chọn)</h6>
                                                                    </div>
                                                                    <span className="badge bg-secondary">Không bắt buộc</span>
                                                                </div>
                                                                <div className="row g-3">
                                                                    {certificates.length > 0 && (
                                                                        <div className="col-12 mb-3">
                                                                            <div className="row g-2">
                                                                                {certificates.map((cert, index) => (
                                                                                    <div key={index} className="col-md-6">
                                                                                        <div className="border rounded p-3 bg-white">
                                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                                <div className="d-flex align-items-center flex-grow-1">
                                                                                                    <i className="bi bi-file-earmark-check text-success me-2"></i>
                                                                                                    <small className="text-truncate">{cert.name}</small>
                                                                                                </div>
                                                                                                <button 
                                                                                                    className="btn btn-sm btn-outline-danger ms-2"
                                                                                                    onClick={() => setCertificates(prev => prev.filter((_, i) => i !== index))}
                                                                                                >
                                                                                                    <i className="bi bi-trash"></i>
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="col-12">
                                                                        <div 
                                                                            className="border-2 border-dashed rounded p-4 text-center bg-light"
                                                                            style={{
                                                                                borderColor: '#dee2e6',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                            onClick={() => document.getElementById('certificateInput').click()}
                                                                            onDragOver={(e) => {
                                                                                e.preventDefault();
                                                                                e.currentTarget.style.borderColor = '#0d6efd';
                                                                                e.currentTarget.style.backgroundColor = '#f8f9ff';
                                                                            }}
                                                                            onDragLeave={(e) => {
                                                                                e.preventDefault();
                                                                                e.currentTarget.style.borderColor = '#dee2e6';
                                                                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                                            }}
                                                                            onDrop={(e) => {
                                                                                e.preventDefault();
                                                                                e.currentTarget.style.borderColor = '#dee2e6';
                                                                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                                                const files = Array.from(e.dataTransfer.files);
                                                                                setCertificates(prev => [...prev, ...files]);
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-cloud-upload fs-2 text-muted mb-2 d-block"></i>
                                                                            <p className="mb-2 text-muted">
                                                                                {certificates.length > 0 ? 'Thêm chứng chỉ khác' : 'Kéo thả chứng chỉ vào đây'}
                                                                            </p>
                                                                            <p className="mb-0 small text-muted">
                                                                                Hoặc <span className="text-primary">nhấn để chọn file</span>
                                                                            </p>
                                                                            <small className="text-muted">Hỗ trợ: JPG, PNG, PDF (tối đa 10MB)</small>
                                                                        </div>
                                    <input
                                                                            id="certificateInput"
                                        type="file"
                                                                            className="d-none"
                                                                            accept="image/*,.pdf"
                                                                            multiple
                                                                            onChange={(e) => {
                                                                                const files = Array.from(e.target.files);
                                                                                setCertificates(prev => [...prev, ...files]);
                                                                                e.target.value = ''; // Reset input
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Navigation Buttons */}
                                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                                        <button 
                                                            className="btn btn-outline-secondary btn-lg px-4"
                                                            onClick={() => setCurrentStep(3)}
                                                        >
                                                            <i className="bi bi-arrow-left me-2"></i> Quay lại
                                                        </button>
                                                        
                                                        {!isAllStepsValid && (
                                                            <div className="text-danger small">
                                                                <i className="bi bi-exclamation-triangle me-1"></i>
                                                                Vui lòng hoàn thành tất cả thông tin bắt buộc
                                                            </div>
                                    )}
                                </div>

                                                    {/* Final Submit Button */}
                                                    <div className="text-center">
                                    <button
                                                            className="btn btn-lg px-5"
                                                            style={{
                                                                background: isAllStepsValid 
                                                                    ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                                                                    : '#6c757d',
                                                                border: 'none',
                                                                borderRadius: '12px',
                                                                color: 'white',
                                                                fontWeight: '600',
                                                                boxShadow: isAllStepsValid 
                                                                    ? '0 4px 20px rgba(102, 126, 234, 0.3)' 
                                                                    : '0 2px 10px rgba(0,0,0,0.1)',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                        onClick={handleSubmit}
                                                            disabled={loading || !isAllStepsValid}
                                    >
                                        {loading ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                                                    Đang xử lý...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bi bi-check-circle me-2"></i>
                                                                    Hoàn thành hồ sơ
                                                                </>
                                                            )}
                                    </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
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

export default CompleteProfile; 