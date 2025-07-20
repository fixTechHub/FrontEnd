import React, { useState } from 'react';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import BookingWizard from './common/BookingHeader';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTechnicianProfile } from '../../features/technicians/technicianSlice';
import { useBookingParams } from '../../hooks/useBookingParams';
import { selectTechnicianThunk } from '../../features/bookings/bookingSlice';
import Rating from 'react-rating';
import TechnicianProfile from '../../components/profile/TechnicianProfile';
import { Button, Modal } from 'react-bootstrap';

function ChooseTechnician() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [modalShow, setModalShow] = useState(false);
    const { profile, loading, error } = useSelector(state => state.technician);
    const { newBooking, status: createBookingStatus } = useSelector(state => state.booking);
    const { techniciansFound, status: techniciansFoundStatus } = useSelector(state => state.booking);
    const { bookingId, stepsForCurrentUser } = useBookingParams();
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
    const [confirming, setConfirming] = useState(false);

    const technician = profile?.technician;
    const certificates = profile?.certificates;
    const user = technician?.userId ?? {};
    const specialties = technician?.specialtiesCategories ?? [];

    const handleShowTechnicianInfo = (id) => {
        setSelectedTechnicianId(id);
        dispatch(fetchTechnicianProfile(id));
    };

    console.log('--- CREATE BOOKING LOG ---', newBooking);
    console.log('--- TECHNICIAN FOUND LOG ---', techniciansFound);

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);

    const handleShowProfile = (technician) => {
        setSelectedTechnician(technician);
        setShowProfileModal(true);
    };

    const handleCloseProfile = () => {
        setShowProfileModal(false);
        setSelectedTechnician(null); // Clear data on close
    };

    const handleComfirm = async (technicianId) => {
        if (!window.confirm('Bạn muốn chọn kỹ thuật viên này?')) return;
        setConfirming(true);
        try {
            const resultAction = await dispatch(selectTechnicianThunk({ bookingId, technicianId }));
            if (selectTechnicianThunk.fulfilled.match(resultAction)) {
                alert('Đã gửi yêu cầu xác nhận đến kỹ thuật viên!');
                navigate(`/booking/booking-processing?bookingId=${bookingId}`);
            } else {
                alert(resultAction.payload || 'Có lỗi xảy ra!');
            }
        } finally {
            setConfirming(false);
        }
    };

    return (
        <>
            <Header />

            <BreadcrumbBar title={'Chọn Kỹ Thuật Viên'} subtitle={'Choose Technician'} />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard steps={stepsForCurrentUser} activeStep={2} />

                    <section className="section car-listing pt-0">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-3 col-lg-4 col-sm-12 col-12 theiaStickySidebar">
                                    <form action="#" autoComplete="off" className="sidebar-form">
                                        <div className="sidebar-heading">
                                            <h3>What Are You Looking For</h3>
                                        </div>
                                        <div className="product-search">
                                            <div className="form-custom">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="member_search1"
                                                    placeholder=""
                                                />
                                                <span>
                                                    <img src="/img/icons/search.svg" alt="img" />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="product-availability">
                                            <h6>Availability</h6>
                                            <div className="status-toggle">
                                                <input
                                                    id="mobile_notifications"
                                                    className="check"
                                                    type="checkbox"
                                                    defaultChecked=""
                                                />
                                                <label
                                                    htmlFor="mobile_notifications"
                                                    className="checktoggle"
                                                >
                                                    checkbox
                                                </label>
                                            </div>
                                        </div>
                                        <div className="accord-list">
                                            <div className="accordion" id="accordionMain1">
                                                <div className="card-header-new" id="headingOne">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapseOne"
                                                            aria-expanded="true"
                                                            aria-controls="collapseOne"
                                                        >
                                                            Car Brand
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapseOne"
                                                    className="collapse show"
                                                    aria-labelledby="headingOne"
                                                    data-bs-parent="#accordionExample1"
                                                >
                                                    <div className="card-body-chat">
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <div id="checkBoxes1">
                                                                    <div className="selectBox-cont">
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> Tesla
                                                                        </label>
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> Ford
                                                                        </label>
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> Mercediz Benz
                                                                        </label>
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> Audi
                                                                        </label>
                                                                        {/* View All */}
                                                                        <div className="view-content">
                                                                            <div className="viewall-One">
                                                                                <label className="custom_check w-100">
                                                                                    <input type="checkbox" name="username" />
                                                                                    <span className="checkmark" /> Kia
                                                                                </label>
                                                                                <label className="custom_check w-100">
                                                                                    <input type="checkbox" name="username" />
                                                                                    <span className="checkmark" /> Honda
                                                                                </label>
                                                                                <label className="custom_check w-100">
                                                                                    <input type="checkbox" name="username" />
                                                                                    <span className="checkmark" /> Toyota
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        {/* /View All */}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain2">
                                                <div className="card-header-new" id="headingTwo">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapseTwo"
                                                            aria-expanded="true"
                                                            aria-controls="collapseTwo"
                                                        >
                                                            Car Category
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapseTwo"
                                                    className="collapse"
                                                    aria-labelledby="headingTwo"
                                                    data-bs-parent="#accordionExample2"
                                                >
                                                    <div className="card-body-chat">
                                                        <div id="checkBoxes2">
                                                            <div className="selectBox-cont">
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> Convertible (25)
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> Coupe (15)
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> Sedan (10)
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> EV (5)
                                                                </label>
                                                                {/* View All */}
                                                                <div className="view-content">
                                                                    <div className="viewall-One">
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> Hatchback (123)
                                                                        </label>
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> Luxury (06)
                                                                        </label>
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> SUV (6)
                                                                        </label>
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> Wagon (5)
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                {/* /View All */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain3">
                                                <div className="card-header-new" id="headingYear">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapseYear"
                                                            aria-expanded="true"
                                                            aria-controls="collapseYear"
                                                        >
                                                            Year
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapseYear"
                                                    className="collapse"
                                                    aria-labelledby="headingYear"
                                                    data-bs-parent="#accordionExample2"
                                                >
                                                    <div className="card-body-chat">
                                                        <div id="checkBoxes02">
                                                            <div className="selectBox-cont">
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> 2024
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> 2022
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> 2021
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> 2020
                                                                </label>
                                                                {/* View All */}
                                                                <div className="view-content">
                                                                    <div className="viewall-One">
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> 2019
                                                                        </label>
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> 2018
                                                                        </label>
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> 2019
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                {/* /View All */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain04">
                                                <div className="card-header-new" id="headingfuel">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapsefuel"
                                                            aria-expanded="true"
                                                            aria-controls="collapsefuel"
                                                        >
                                                            Fuel Type
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapsefuel"
                                                    className="collapse"
                                                    aria-labelledby="headingfuel"
                                                    data-bs-parent="#accordionExample2"
                                                >
                                                    <div className="card-body-chat">
                                                        <div className="fuel-list">
                                                            <ul>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="petrol"
                                                                            value="red"
                                                                            defaultChecked=""
                                                                        />
                                                                        <label htmlFor="petrol">Petrol</label>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="diesel"
                                                                            value="red"
                                                                            defaultChecked=""
                                                                        />
                                                                        <label htmlFor="diesel">Diesel</label>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="electric"
                                                                            value="red"
                                                                            defaultChecked=""
                                                                        />
                                                                        <label htmlFor="electric">Electric</label>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="cng"
                                                                            value="red"
                                                                            defaultChecked=""
                                                                        />
                                                                        <label htmlFor="cng">CNG</label>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain5">
                                                <div className="card-header-new" id="headingmileage">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapsemileage"
                                                            aria-expanded="true"
                                                            aria-controls="collapsemileage"
                                                        >
                                                            Mileage
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapsemileage"
                                                    className="collapse"
                                                    aria-labelledby="headingmileage"
                                                    data-bs-parent="#accordionExample2"
                                                >
                                                    <div className="card-body-chat">
                                                        <div className="fuel-list">
                                                            <ul>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input
                                                                            type="radio"
                                                                            name="mileage"
                                                                            id="limited"
                                                                            value="red"
                                                                            defaultChecked=""
                                                                        />
                                                                        <label htmlFor="limited">Limited</label>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input
                                                                            type="radio"
                                                                            name="mileage"
                                                                            id="unlimited"
                                                                            value="red"
                                                                            defaultChecked=""
                                                                        />
                                                                        <label htmlFor="unlimited">Unlimited</label>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain6">
                                                <div className="card-header-new" id="headingrental">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapserental"
                                                            aria-expanded="true"
                                                            aria-controls="collapserental"
                                                        >
                                                            Rental Type
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapserental"
                                                    className="collapse"
                                                    aria-labelledby="headingrental"
                                                    data-bs-parent="#accordionExample2"
                                                >
                                                    <div className="card-body-chat">
                                                        <div className="fuel-list">
                                                            <ul>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input type="radio" name="any" id="any" />
                                                                        <label htmlFor="any">Any</label>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input
                                                                            type="radio"
                                                                            name="day"
                                                                            id="day"
                                                                            defaultChecked=""
                                                                        />
                                                                        <label htmlFor="day">Per Day</label>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input
                                                                            type="radio"
                                                                            name="hour"
                                                                            id="hour"
                                                                            defaultChecked=""
                                                                        />
                                                                        <label htmlFor="hour">Per Hour</label>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input type="radio" name="week" id="week" />
                                                                        <label htmlFor="week">Per Week</label>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain06">
                                                <div className="card-header-new" id="headingspec">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapsespec"
                                                            aria-expanded="true"
                                                            aria-controls="collapsespec"
                                                        >
                                                            Car Specifications
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapsespec"
                                                    className="collapse"
                                                    aria-labelledby="headingspec"
                                                    data-bs-parent="#accordionExample2"
                                                >
                                                    <div className="card-body-chat">
                                                        <div id="checkBoxes20">
                                                            <div className="selectBox-cont">
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> Air Conditioners
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> Keyless
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> Panoramic
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" /> Bluetooth
                                                                </label>
                                                                {/* View All */}
                                                                <div className="view-content">
                                                                    <div className="viewall-One">
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> Aux
                                                                        </label>
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> Top Window
                                                                        </label>
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> Speakers
                                                                        </label>
                                                                        <label className="custom_check w-100">
                                                                            <input type="checkbox" name="username" />
                                                                            <span className="checkmark" /> Automatic Window
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                {/* /View All */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain7">
                                                <div className="card-header-new" id="headingColor">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapseColor"
                                                            aria-expanded="true"
                                                            aria-controls="collapseColor"
                                                        >
                                                            Colors
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapseColor"
                                                    className="collapse"
                                                    aria-labelledby="headingColor"
                                                    data-bs-parent="#accordionExample2"
                                                >
                                                    <div className="card-body-chat">
                                                        <div className="theme-colorsset">
                                                            <ul>
                                                                <li>
                                                                    <div className="input-themeselects">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="greenColor"
                                                                            value="red"
                                                                            defaultChecked=""
                                                                        />
                                                                        <label
                                                                            htmlFor="greenColor"
                                                                            className="green-clr"
                                                                        />
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-themeselects">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="yellowColor"
                                                                            value="yellow"
                                                                        />
                                                                        <label
                                                                            htmlFor="yellowColor"
                                                                            className="yellow-clr"
                                                                        />
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-themeselects">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="brownColor"
                                                                            value="blue"
                                                                        />
                                                                        <label
                                                                            htmlFor="brownColor"
                                                                            className="brown-clr"
                                                                        />
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-themeselects">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="blackColor"
                                                                            value="green"
                                                                        />
                                                                        <label
                                                                            htmlFor="blackColor"
                                                                            className="black-clr"
                                                                        />
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-themeselects">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="redColor"
                                                                            value="red"
                                                                            defaultChecked=""
                                                                        />
                                                                        <label htmlFor="redColor" className="red-clr" />
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-themeselects">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="grayColor"
                                                                            value="blue"
                                                                        />
                                                                        <label htmlFor="grayColor" className="gray-clr" />
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-themeselects">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="gray100Color"
                                                                            value="green"
                                                                        />
                                                                        <label
                                                                            htmlFor="gray100Color"
                                                                            className="gray100-clr"
                                                                        />
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-themeselects">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="blueColor"
                                                                            value="yellow"
                                                                        />
                                                                        <label htmlFor="blueColor" className="blue-clr" />
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-themeselects">
                                                                        <input
                                                                            type="radio"
                                                                            name="color"
                                                                            id="whiteColor"
                                                                            value="yellow"
                                                                        />
                                                                        <label htmlFor="whiteColor" className="white-clr" />
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain8">
                                                <div className="card-header-new" id="headingThree">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapseThree"
                                                            aria-expanded="true"
                                                            aria-controls="collapseThree"
                                                        >
                                                            Capacity
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapseThree"
                                                    className="collapse"
                                                    aria-labelledby="headingThree"
                                                    data-bs-parent="#accordionExample3"
                                                >
                                                    <div className="card-body-chat">
                                                        <div id="checkBoxes3">
                                                            <div className="selectBox-cont">
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="bystatus" />
                                                                    <span className="checkmark" /> 2 Seater
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="bystatus" />
                                                                    <span className="checkmark" /> 4 Seater
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="bystatus" />
                                                                    <span className="checkmark" /> 5 Seater
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="bystatus" />
                                                                    <span className="checkmark" /> 7 Seater
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain9">
                                                <div className="card-header-new" id="headingFour">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapseFour"
                                                            aria-expanded="true"
                                                            aria-controls="collapseFour"
                                                        >
                                                            Price
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapseFour"
                                                    className="collapse"
                                                    aria-labelledby="headingFour"
                                                    data-bs-parent="#accordionExample4"
                                                >
                                                    <div className="card-body-chat">
                                                        <div className="filter-range">
                                                            <input type="text" className="input-range" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain4">
                                                <div className="card-header-new" id="headingtransmiss">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapsetransmission"
                                                            aria-expanded="true"
                                                            aria-controls="collapsetransmission"
                                                        >
                                                            Transmission
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapsetransmission"
                                                    className="collapse"
                                                    aria-labelledby="headingtransmiss"
                                                    data-bs-parent="#accordionExample2"
                                                >
                                                    <div className="card-body-chat">
                                                        <div className="fuel-list">
                                                            <ul>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input
                                                                            type="radio"
                                                                            name="transmission"
                                                                            id="manual"
                                                                            defaultChecked=""
                                                                        />
                                                                        <label htmlFor="manual">Manual </label>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input type="radio" name="transmission" id="semi" />
                                                                        <label htmlFor="semi">Semi Automatic</label>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="input-selection">
                                                                        <input
                                                                            type="radio"
                                                                            name="transmission"
                                                                            id="automatic"
                                                                        />
                                                                        <label htmlFor="automatic">Automatic</label>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain10">
                                                <div className="card-header-new" id="headingFive">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapseFive"
                                                            aria-expanded="true"
                                                            aria-controls="collapseFive"
                                                        >
                                                            Rating
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapseFive"
                                                    className="collapse"
                                                    aria-labelledby="headingFive"
                                                    data-bs-parent="#accordionExample5"
                                                >
                                                    <div className="card-body-chat">
                                                        <div id="checkBoxes4">
                                                            <div className="selectBox-cont">
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="category" />
                                                                    <span className="checkmark" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star filled" />
                                                                    <span className="rating-count">5.0</span>
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="category" />
                                                                    <span className="checkmark" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star" />
                                                                    <span className="rating-count">4.0</span>
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="category" />
                                                                    <span className="checkmark" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star" />
                                                                    <i className="fas fa-star" />
                                                                    <span className="rating-count">3.0</span>
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="category" />
                                                                    <span className="checkmark" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star" />
                                                                    <i className="fas fa-star" />
                                                                    <i className="fas fa-star" />
                                                                    <span className="rating-count">2.0</span>
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="username" />
                                                                    <span className="checkmark" />
                                                                    <i className="fas fa-star filled" />
                                                                    <i className="fas fa-star" />
                                                                    <i className="fas fa-star" />
                                                                    <i className="fas fa-star" />
                                                                    <i className="fas fa-star" />
                                                                    <span className="rating-count">1.0</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion" id="accordionMain11">
                                                <div className="card-header-new" id="headingSix">
                                                    <h6 className="filter-title">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="w-100 collapsed"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapseSix"
                                                            aria-expanded="true"
                                                            aria-controls="collapseSix"
                                                        >
                                                            Customer Recommendation
                                                            <span className="float-end">
                                                                <i className="fa-solid fa-chevron-down" />
                                                            </span>
                                                        </a>
                                                    </h6>
                                                </div>
                                                <div
                                                    id="collapseSix"
                                                    className="collapse"
                                                    aria-labelledby="headingSix"
                                                    data-bs-parent="#accordionExample6"
                                                >
                                                    <div className="card-body-chat">
                                                        <div id="checkBoxes5">
                                                            <div className="selectBox-cont">
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="category" />
                                                                    <span className="checkmark" /> 70% &amp; up
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="category" />
                                                                    <span className="checkmark" /> 60% &amp; up
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="category" />
                                                                    <span className="checkmark" /> 50% &amp; up
                                                                </label>
                                                                <label className="custom_check w-100">
                                                                    <input type="checkbox" name="category" />
                                                                    <span className="checkmark" /> 40% &amp; up
                                                                </label>
                                                                <div className="viewall-Two">
                                                                    <label className="custom_check w-100">
                                                                        <input type="checkbox" name="username" />
                                                                        <span className="checkmark" />
                                                                        30% &amp; up
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="d-inline-flex align-items-center justify-content-center btn w-100 btn-primary filter-btn"
                                        >
                                            <span>
                                                <i className="feather-filter me-2" />
                                            </span>
                                            Filter results
                                        </button>
                                        <a href="#" className="reset-filter">
                                            Reset Filter
                                        </a>
                                    </form>
                                </div>

                                <div className="col-lg-9">
                                    <div className="row">

                                        {techniciansFound && techniciansFound.map((technician) => (
                                            <>
                                                {/* <div className="col-xxl-4 col-lg-6 col-md-6 col-12">
                                                    <div className="listing-item">
                                                        <div className="listing-img">
                                                            <a href="listing-details.html">
                                                                <img
                                                                    style={{ height: 282 }}
                                                                    src={technician?.userInfo?.avatar || ''}
                                                                    className="img-fluid"
                                                                    alt="Audi"
                                                                />
                                                            </a>
                                                            <div className="fav-item justify-content-end">
                                                                <a href="javascript:void(0)" className="fav-icon">
                                                                    <i className="feather-heart" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="listing-content">
                                                            <div className="listing-features d-flex align-items-end justify-content-between">
                                                                <div className="list-rating">
                                                                    <h3 className="listing-title">
                                                                        <a href="#">{technician?.userInfo?.fullName}</a>
                                                                    </h3>

                                                                    <div className="list-rating">
                                                                        <Rating
                                                                            style={{ marginLeft: -2 }}
                                                                            initialRating={technician?.ratingAverage}
                                                                            readonly
                                                                            fullSymbol={<i className="fas fa-star filled" />}
                                                                            emptySymbol={<i className="far fa-star" />}
                                                                        />
                                                                        <span>({(technician?.ratingAverage).toFixed(1)})</span>
                                                                        <div style={{ marginTop: 3 }}>150 Reviews</div>
                                                                    </div>
                                                                </div>
                                                                <div className="list-km">
                                                                    <span className="km-count">
                                                                        <img src="/img/icons/map-pin.svg" alt="author" />
                                                                        {technician?.distanceInKm + 'km'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="listing-details-group">
                                                                <ul>
                                                                    <li>
                                                                        <span>
                                                                            <img
                                                                                src="/img/icons/car-parts-04.svg"
                                                                                alt="Power"
                                                                            />
                                                                        </span>
                                                                        <p>{technician?.availability}</p>
                                                                    </li>
                                                                    <li>
                                                                        <span>
                                                                            <img
                                                                                src="/img/icons/car-parts-05.svg"
                                                                                alt="2019"
                                                                            />
                                                                        </span>
                                                                        <p>{technician?.experienceYears} năm</p>
                                                                    </li>
                                                                    <li>
                                                                        <span>
                                                                            <img
                                                                                src="/img/icons/car-parts-06.svg"
                                                                                alt="Persons"
                                                                            />
                                                                        </span>
                                                                        <p>{technician?.jobCompleted} đơn</p>
                                                                    </li>
                                                                </ul>
                                                            </div>

                                                            <div className="listing-location-details">
                                                                <div className="listing-price">
                                                 
                                                                </div>
                                                                <div className="listing-price">
                                                                    <h6>
                                                                        $45 <span>/ Day</span>
                                                                    </h6>
                                                                </div>
                                                            </div>

                                                            <div className="listing-button">
                                                                <a href="listing-details.html" className="btn btn-order">
                                                                    Xác nhận
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div> */}

                                                <div className="listview-car">
                                                    <div className="card">
                                                        <div className="blog-widget d-flex">
                                                            <div className="blog-img">
                                                                <a href="listing-details.html">
                                                                    <img
                                                                        style={{ width: 230, height: 194 }}
                                                                        src={technician?.userInfo?.avatar || ''}
                                                                        className="img-fluid"
                                                                        alt="blog-img"
                                                                    />
                                                                </a>
                                                                <div className="fav-item justify-content-end">
                                                                    <a href="#" className="fav-icon">
                                                                        <i className="feather-heart" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <div className="bloglist-content w-100">
                                                                <div className="card-body">
                                                                    <div className="blog-list-head d-flex">
                                                                        <div className="blog-list-title">
                                                                            <h3>
                                                                                <a onClick={(e) => { e.preventDefault(); handleShowProfile(technician); }}>
                                                                                    {technician?.userInfo?.fullName}
                                                                                </a>
                                                                            </h3>

                                                                            {/* {technician?.category.map((category) => (
                                                                                <h6>
                                                                                    {category?.categoryName}
                                                                                </h6>
                                                                            ))} */}
                                                                            {/* <h6>
                                                                                Kinh nghiệm: <span>{technician?.experienceYears} năm</span>
                                                                            </h6> */}
                                                                            {/* <h6>
                                                                                Loại dịch vụ: <span>{technician?.serviceType === 'COMPLEX' ? 'Phức tạp' : 'Đơn giản'}</span>
                                                                            </h6> */}
                                                                            {/* <h6>
                                                                                {technician?.serviceName}
                                                                            </h6> */}
                                                                            <h6>
                                                                                <span>
                                                                                    <i className="feather-check-circle me-2" />
                                                                                    Đã xác minh
                                                                                </span>
                                                                            </h6>
                                                                        </div>
                                                                        <div style={{ textAlign: 'end' }} className="blog-list-rate">
                                                                            <h6>
                                                                                <span>Từ </span>
                                                                                <span></span>
                                                                                {technician?.tier1Price.toLocaleString()}<span>VNĐ</span>
                                                                            </h6>

                                                                            <Rating
                                                                                initialRating={technician?.ratingAverage}
                                                                                readonly
                                                                                fullSymbol={<i style={{ color: '#FFA633' }} className="fas fa-star filled" />}
                                                                                emptySymbol={<i style={{ color: '#FFA633' }} className="far fa-star" />}
                                                                            />
                                                                            <span>({(technician?.ratingAverage).toFixed(1)})</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="listing-details-group">
                                                                        <ul>
                                                                            <li title={'Đơn đã hoàn thành: ' + technician?.jobCompleted}>
                                                                                <span>
                                                                                    <i className="feather-award me-2" />
                                                                                </span>
                                                                                <p>{technician?.jobCompleted} đơn</p>
                                                                            </li>

                                                                            <li title={'Kinh nghiệm: ' + technician?.experienceYears + ' năm'}>
                                                                                <span>
                                                                                    <i className="feather-clock me-2" />
                                                                                </span>
                                                                                <p>{technician?.experienceYears} năm</p>
                                                                            </li>

                                                                            <li title={'Trạng thái: ' + technician?.availability}>
                                                                                <span>
                                                                                    <i className="feather-activity me-2" />
                                                                                </span>
                                                                                <p>{technician?.availability === 'FREE' ? 'Sẵn sàng nhận việc' : 'Bận'}</p>
                                                                            </li>

                                                                        </ul>
                                                                    </div>
                                                                    <div className="blog-list-head list-head-bottom d-flex">
                                                                        <div className="blog-list-title">
                                                                            <div className="title-bottom">
                                                                                <div className="address-info">
                                                                                    <h6>
                                                                                        <i className="feather-map-pin" />
                                                                                        {technician?.userInfo?.address?.city || 'Đang cập nhật'}
                                                                                    </h6>
                                                                                </div>
                                                                                <div className="list-km">
                                                                                    <span className="km-count">
                                                                                        <img src="/img/icons/map-pin.svg" alt="author" />
                                                                                        {technician?.distanceInKm + 'km'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="listing-button">
                                                                            <button
                                                                                className="btn btn-order"
                                                                                disabled={confirming}
                                                                                onClick={() => handleComfirm(technician._id)}
                                                                            >
                                                                                <span>
                                                                                    <i className="feather-user-check me-2" />
                                                                                </span>
                                                                                {confirming && selectedTechnicianId === technician._id ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>

                                        ))}

                                    </div>
                                    {/*Pagination*/}
                                    <div className="blog-pagination">
                                        <nav>
                                            <ul className="pagination page-item justify-content-center">
                                                <li className="previtem">
                                                    <a className="page-link" href="#">
                                                        <i className="fas fa-regular fa-arrow-left me-2" /> Prev
                                                    </a>
                                                </li>
                                                <li className="justify-content-center pagination-center">
                                                    <div className="page-group">
                                                        <ul>
                                                            <li className="page-item">
                                                                <a className="page-link" href="#">
                                                                    1
                                                                </a>
                                                            </li>
                                                            <li className="page-item">
                                                                <a className="active page-link" href="#">
                                                                    2 <span className="visually-hidden">(current)</span>
                                                                </a>
                                                            </li>
                                                            <li className="page-item">
                                                                <a className="page-link" href="#">
                                                                    3
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </li>
                                                <li className="nextlink">
                                                    <a className="page-link" href="#">
                                                        Next <i className="fas fa-regular fa-arrow-right ms-2" />
                                                    </a>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                    {/* /Pagination */}
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>

            <Modal
                show={showProfileModal}
                size="lg"
                onHide={handleCloseProfile}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Thông Tin Chi Tiết Kỹ Thuật Viên
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TechnicianProfile technician={selectedTechnician} />
                </Modal.Body>
                {/* <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseProfile}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleCloseProfile}>
                        Save Changes
                    </Button>
                </Modal.Footer> */}
            </Modal>
        </>
    );
}

export default ChooseTechnician;
