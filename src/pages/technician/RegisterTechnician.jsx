import Sidebar from '../../components/common/Sidebar';
import React, { useState } from 'react';
import '../../../public/css/admin-style.css';

function RegisterTechnician() {

    const [activeTab, setActiveTab] = useState(0);

    const tabs = ['seller-details', 'company-document', 'bank-detail'];

    const handleNext = () => {
        if (activeTab < tabs.length - 1) {
            setActiveTab(activeTab + 1);
        }
    };

    const handlePrevious = () => {
        if (activeTab > 0) {
            setActiveTab(activeTab - 1);
        }
    };

    return (
        <>
            <div className="main-wrapper">
                <Sidebar />
                <div className="page-wrapper">
                    <div className="content pb-0 me-4">

                        <div className="page-header">
                            <div className="row">
                                <div className="col-sm-12">
                                    <h3 className="page-title">Đăng kí trở thành kĩ thuật viên</h3>
                                </div>
                            </div>
                        </div>
                        {/* /Page Header */}

                        <div className="row">
                            {/* Lightbox */}
                            <div className="col-lg-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h4 className="card-title mb-0">Nhập thông tin</h4>
                                    </div>
                                    <div className="card-body">
                                        <div id="basic-pills-wizard" className="twitter-bs-wizard">
                                            <ul className="nav nav-tabs twitter-bs-wizard-nav">
                                                {tabs.map((tab, index) => (
                                                    <li className="nav-item" key={tab}>
                                                        <a
                                                            href="#"
                                                            className={`nav-link border-0 ${activeTab === index ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setActiveTab(index);
                                                            }}
                                                        >
                                                            <div className="step-icon" title={tab}>
                                                                {index === 0 && <i className="far fa-user"></i>}
                                                                {index === 1 && <i className="fas fa-map-pin"></i>}
                                                                {index === 2 && <i className="fas fa-credit-card"></i>}
                                                            </div>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="tab-content twitter-bs-wizard-tab-content">
                                                <div className={`tab-pane ${activeTab === 0 ? 'show active' : 'fade'}`} id="seller-details">
                                                    <div className="mb-4">
                                                        <h5>Nhập thông tin cá nhân</h5>
                                                    </div>
                                                    <form>
                                                        <div className="row">
                                                            <div className="col-lg-6">
                                                                <div className="mb-3">
                                                                    <label htmlFor="basicpill-firstname-input" className="form-label">
                                                                        Họ và tên
                                                                    </label>
                                                                    <input type="text" className="form-control" id="basicpill-firstname-input" />
                                                                </div>
                                                            </div>
                                                            <div className="col-lg-6">
                                                                <div className="mb-3">
                                                                    <label htmlFor="basicpill-lastname-input" className="form-label">
                                                                        Căn cước công dân
                                                                    </label>
                                                                    <input type="text" className="form-control" id="basicpill-lastname-input" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row">
                                                            <div className="col-lg-6">
                                                                <div className="mb-3">
                                                                    <label htmlFor="basicpill-phoneno-input" className="form-label">
                                                                        Số điện thoại
                                                                    </label>
                                                                    <input type="text" className="form-control" id="basicpill-phoneno-input" />
                                                                </div>
                                                            </div>
                                                            <div className="col-lg-6">
                                                                <div className="mb-3">
                                                                    <label htmlFor="basicpill-email-input" className="form-label">
                                                                        Email
                                                                    </label>
                                                                    <input type="email" className="form-control" id="basicpill-email-input" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row">
                                                            <div className="col-lg-6">
                                                                <div className="mb-3">
                                                                    <label htmlFor="basicpill-certificate-upload" className="form-label">
                                                                        Tải lên chứng chỉ (không bắt buộc)
                                                                    </label>
                                                                    <input
                                                                        type="file"
                                                                        className="form-control"
                                                                        id="basicpill-certificate-upload"
                                                                        accept=".pdf, image/*"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>

                                                    <ul className="pager wizard twitter-bs-wizard-pager-link">
                                                        <li className="next">
                                                            <button className="btn btn-primary" onClick={handleNext}>
                                                                Tiếp theo <i className="bx bx-chevron-right ms-1"></i>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>


                                                <div className={`tab-pane ${activeTab === 1 ? 'show active' : 'fade'}`} id="company-document">
                                                    <div>
                                                        <div className="mb-4">
                                                            <h5>Nhập địa chỉ</h5>
                                                        </div>
                                                        <form>
                                                            <div className="row">
                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="basicpill-pancard-input" className="form-label">
                                                                            Địa chỉ
                                                                        </label>
                                                                        <input type="text" className="form-control" id="basicpill-pancard-input" />
                                                                    </div>
                                                                </div>

                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="basicpill-vatno-input" className="form-label">
                                                                            Phường
                                                                        </label>
                                                                        <input type="text" className="form-control" id="basicpill-vatno-input" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="basicpill-cstno-input" className="form-label">
                                                                            Thành phố/ Tỉnh
                                                                        </label>
                                                                        <input type="text" className="form-control" id="basicpill-cstno-input" />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </form>
                                                        <ul className="pager wizard twitter-bs-wizard-pager-link d-flex justify-content-between">
                                                            <li className="previous">
                                                                <button className="btn btn-primary" onClick={handlePrevious}>
                                                                    <i className="bx bx-chevron-left me-1"></i> Quay lại
                                                                </button>
                                                            </li>
                                                            <li className="next">
                                                                <button className="btn btn-primary" onClick={handleNext}>
                                                                    Tiếp theo <i className="bx bx-chevron-right ms-1"></i>
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <div className={`tab-pane ${activeTab === 2 ? 'show active' : 'fade'}`} id="bank-detail">
                                                    <div>
                                                        <div className="mb-4">
                                                            <h5>Thanh toán</h5>
                                                        </div>
                                                        <form>
                                                            <div className="row">
                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="basicpill-namecard-input" className="form-label">
                                                                            Chủ Tài Khoản
                                                                        </label>
                                                                        <input type="text" className="form-control" id="basicpill-namecard-input" />
                                                                    </div>
                                                                </div>

                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label className="form-label">Tên Ngân Hàng</label>
                                                                        <select className="form-select">
                                                                            <option defaultValue>Chọn Ngân Hàng</option>
                                                                            <option value="AE">American Express</option>
                                                                            <option value="VI">Visa</option>
                                                                            <option value="MC">MasterCard</option>
                                                                            <option value="DI">Discover</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="basicpill-cardno-input" className="form-label">
                                                                            Số Tài Khoản
                                                                        </label>
                                                                        <input type="text" className="form-control" id="basicpill-cardno-input" />
                                                                    </div>
                                                                </div>

                                                                <div className="col-lg-6">
                                                                    <div className="mb-3">
                                                                        <label htmlFor="basicpill-card-verification-input" className="form-label">
                                                                            Chi Nhánh
                                                                        </label>
                                                                        <input type="text" className="form-control" id="basicpill-card-verification-input" />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </form>
                                                        <ul className="pager wizard twitter-bs-wizard-pager-link d-flex justify-content-between">
                                                            <li className="previous">
                                                                <button className="btn btn-primary" onClick={handlePrevious}>
                                                                    <i className="bx bx-chevron-left me-1"></i> Quay lại
                                                                </button>
                                                            </li>
                                                            <li className="float-end">
                                                                <a href="#" className="btn btn-primary">
                                                                    Gửi
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>

                                            </div>
                                            {/* end tab content */}
                                        </div>
                                    </div>
                                    {/* end card body */}
                                </div>
                            </div>
                            {/* /Wizard */}
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default RegisterTechnician;




