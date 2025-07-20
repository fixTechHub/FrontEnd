import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import Menu from "../../components/common/Menu";

function TechnicianDashboard() {
    return (
        <>
            <Header />

            <BreadcrumbBar title={'Bảng Điều Khiển'} subtitle={'Technician Dashboard'} />

            <Menu />


            <div className="content dashboard-content">
                <div className="container">
                    {/* Content Header */}
                    <div className="content-header">
                        <h4>Dashboard</h4>
                    </div>
                    {/* /Content Header */}

                    {/* Dashboard */}
                    <div className="row">

                        {/* Widget Item */}
                        <div className="col-lg-3 col-md-6 d-flex">
                            <div className="widget-box flex-fill">
                                <div className="widget-header">
                                    <div className="widget-content">
                                        <h6>My Bookings</h6>
                                        <h3>450</h3>
                                    </div>
                                    <div className="widget-icon">
                                        <span>
                                            <img src="/img/icons/book-icon.svg" alt="icon" />
                                        </span>
                                    </div>
                                </div>
                                <a href="user-bookings.html" className="view-link">View all Bookings <i className="feather-arrow-right"></i></a>
                            </div>
                        </div>
                        {/* /Widget Item */}

                        {/* Widget Item */}
                        <div className="col-lg-3 col-md-6 d-flex">
                            <div className="widget-box flex-fill">
                                <div className="widget-header">
                                    <div className="widget-content">
                                        <h6>Wallet Balance</h6>
                                        <h3>$24,665</h3>
                                    </div>
                                    <div className="widget-icon">
                                        <span className="bg-warning">
                                            <img src="/img/icons/balance-icon.svg" alt="icon" />
                                        </span>
                                    </div>
                                </div>
                                <a href="user-wallet.html" className="view-link">View Balance <i className="feather-arrow-right"></i></a>
                            </div>
                        </div>
                        {/* /Widget Item */}

                        {/* Widget Item */}
                        <div className="col-lg-3 col-md-6 d-flex">
                            <div className="widget-box flex-fill">
                                <div className="widget-header">
                                    <div className="widget-content">
                                        <h6>Total Transactions</h6>
                                        <h3>$15,210</h3>
                                    </div>
                                    <div className="widget-icon">
                                        <span className="bg-success">
                                            <img src="/img/icons/transaction-icon.svg" alt="icon" />
                                        </span>
                                    </div>
                                </div>
                                <a href="user-payment.html" className="view-link">View all Transactions <i className="feather-arrow-right"></i></a>
                            </div>
                        </div>
                        {/* /Widget Item */}

                        {/* Widget Item */}
                        <div className="col-lg-3 col-md-6 d-flex">
                            <div className="widget-box flex-fill">
                                <div className="widget-header">
                                    <div className="widget-content">
                                        <h6>Wishlist Cars</h6>
                                        <h3>24</h3>
                                    </div>
                                    <div className="widget-icon">
                                        <span className="bg-danger">
                                            <img src="/img/icons/cars-icon.svg" alt="icon" />
                                        </span>
                                    </div>
                                </div>
                                <a href="user-wishlist.html" className="view-link">Go to Wishlist <i className="feather-arrow-right"></i></a>
                            </div>
                        </div>
                        {/* /Widget Item */}

                    </div>

                    <div className="row">

                        {/* Last 5 Bookings */}
                        <div className="col-lg-8 d-flex">
                            <div className="card user-card flex-fill">
                                <div className="card-header">
                                    <div className="row align-items-center">
                                        <div className="col-sm-5">
                                            <h5>Last 5 Bookings</h5>
                                        </div>

                                        {/* <div className="col-sm-7 text-sm-end">
                                            <div className="booking-select">
                                                <select className="form-control select">
                                                    <option>Last 30 Days</option>
                                                    <option>Last 7 Days</option>
                                                </select>
                                                <a href="user-bookings.html" className="view-link">View all Bookings</a>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive dashboard-table dashboard-table-info">
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div className="table-avatar">
                                                            <a href="user-bookings.html" className="avatar avatar-lg flex-shrink-0">
                                                                <img className="avatar-img" src="/img/cars/car-04.jpg" alt="Booking" />
                                                            </a>
                                                            <div className="table-head-name flex-grow-1">
                                                                <a href="user-bookings.html">Ferrari 458 MM Speciale</a>
                                                                <p>Rent Type : Hourly</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <h6>Start date</h6>
                                                        <p>15 Sep 2023, 11:30 PM</p>
                                                    </td>
                                                    <td>
                                                        <h6>End Date</h6>
                                                        <p>15 Sep 2023, 1:30 PM</p>
                                                    </td>
                                                    <td>
                                                        <h6>Price</h6>
                                                        <h5 className="text-danger">$200</h5>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-light-secondary">Upcoming</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div className="table-avatar">
                                                            <a href="user-bookings.html" className="avatar avatar-lg flex-shrink-0">
                                                                <img className="avatar-img" src="/img/cars/car-05.jpg" alt="Booking" />
                                                            </a>
                                                            <div className="table-head-name flex-grow-1">
                                                                <a href="user-bookings.html">Kia Soul 2016</a>
                                                                <p>Rent Type : Hourly</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <h6>Start date</h6>
                                                        <p>15 Sep 2023, 09:00 AM</p>
                                                    </td>
                                                    <td>
                                                        <h6>End Date</h6>
                                                        <p>15 Sep 2023, 1:30 PM</p>
                                                    </td>
                                                    <td>
                                                        <h6>Price</h6>
                                                        <h5 className="text-danger">$300</h5>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-light-secondary">Upcoming</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div className="table-avatar">
                                                            <a href="user-bookings.html" className="avatar avatar-lg flex-shrink-0">
                                                                <img className="avatar-img" src="/img/cars/car-01.jpg" alt="Booking" />
                                                            </a>
                                                            <div className="table-head-name flex-grow-1">
                                                                <a href="user-bookings.html">Toyota Camry SE 350</a>
                                                                <p>Rent Type : Day</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <h6>Start date</h6>
                                                        <p>18 Sep 2023, 09:00 AM</p>
                                                    </td>
                                                    <td>
                                                        <h6>End Date</h6>
                                                        <p>18 Sep 2023, 05:00 PM</p>
                                                    </td>
                                                    <td>
                                                        <h6>Price</h6>
                                                        <h5 className="text-danger">$600</h5>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-light-warning">Inprogress</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div className="table-avatar">
                                                            <a href="user-bookings.html" className="avatar avatar-lg flex-shrink-0">
                                                                <img className="avatar-img" src="/img/cars/car-03.jpg" alt="Booking" />
                                                            </a>
                                                            <div className="table-head-name flex-grow-1">
                                                                <a href="user-bookings.html">Audi A3 2019 new</a>
                                                                <p>Rent Type : Weekly</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <h6>Start date</h6>
                                                        <p>10 Oct 2023, 10:30 AM</p>
                                                    </td>
                                                    <td>
                                                        <h6>End Date</h6>
                                                        <p>16 Oct 2023, 10:30 AM</p>
                                                    </td>
                                                    <td>
                                                        <h6>Price</h6>
                                                        <h5 className="text-danger">$800</h5>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-light-success">Completed</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div className="table-avatar">
                                                            <a href="user-bookings.html" className="avatar avatar-lg flex-shrink-0">
                                                                <img className="avatar-img" src="/img/cars/car-05.jpg" alt="Booking" />
                                                            </a>
                                                            <div className="table-head-name flex-grow-1">
                                                                <a href="user-bookings.html">2018 Chevrolet Camaro</a>
                                                                <p>Rent Type : Hourly</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <h6>Start date</h6>
                                                        <p>14 Nov 2023, 02:00 PM</p>
                                                    </td>
                                                    <td>
                                                        <h6>End Date</h6>
                                                        <p>14 Nov 2023, 04:00 PM</p>
                                                    </td>
                                                    <td>
                                                        <h6>Price</h6>
                                                        <h5 className="text-danger">$240</h5>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-light-success">Completed</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div className="table-avatar">
                                                            <a href="user-bookings.html" className="avatar avatar-lg flex-shrink-0">
                                                                <img className="avatar-img" src="/img/cars/car-06.jpg" alt="Booking" />
                                                            </a>
                                                            <div className="table-head-name flex-grow-1">
                                                                <a href="user-bookings.html">Acura Sport Version</a>
                                                                <p>Rent Type : Monthly</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <h6>Start date</h6>
                                                        <p>01 Dec 2023, 08:15 AM</p>
                                                    </td>
                                                    <td>
                                                        <h6>End Date</h6>
                                                        <p>01 Jan 2024, 08:15 AM</p>
                                                    </td>
                                                    <td>
                                                        <h6>Price</h6>
                                                        <h5 className="text-danger">$1000</h5>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-light-danger">Cancelled</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* /Last 5 Bookings */}

                        {/* Recent Transaction */}
                        <div className="col-lg-4 d-flex">
                            <div className="card user-card flex-fill">
                                <div className="card-header">
                                    <div className="row align-items-center">
                                        <div className="col-sm-6">
                                            <h5>Recent Transaction</h5>
                                        </div>
                                        
                                        {/* <div className="col-sm-6 text-sm-end">
                                            <div className="booking-select">
                                                <select className="form-control select">
                                                    <option>Last 30 Days</option>
                                                    <option>Last 7 Days</option>
                                                </select>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive dashboard-table dashboard-table-info">
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <td className="border-0">
                                                        <div className="table-avatar">
                                                            <a href="user-bookings.html" className="avatar avatar-md flex-shrink-0">
                                                                <img className="avatar-img" src="/img/cars/car-04.jpg" alt="Booking" />
                                                            </a>
                                                            <div className="table-head-name flex-grow-1">
                                                                <a href="user-bookings.html">Ferrari 458 MM Speciale</a>
                                                                <p>Rent Type : Hourly</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="border-0 text-end">
                                                        <span className="badge badge-light-secondary">Upcoming</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="2" className="pt-0">
                                                        <div className="status-box">
                                                            <p><span>Status : </span>On 15 Sep 2023, 11:30 PM</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border-0">
                                                        <div className="table-avatar">
                                                            <a href="user-bookings.html" className="avatar avatar-md flex-shrink-0">
                                                                <img className="avatar-img" src="/img/cars/car-07.jpg" alt="Booking" />
                                                            </a>
                                                            <div className="table-head-name flex-grow-1">
                                                                <a href="user-bookings.html">Chevrolet Pick Truck 3.5L</a>
                                                                <p>Rent Type : Day</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="border-0 text-end">
                                                        <span className="badge badge-light-warning">Refund started </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="2" className="pt-0">
                                                        <div className="status-box">
                                                            <p><span>Status : </span>Yet to recieve</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border-0">
                                                        <div className="table-avatar">
                                                            <a href="user-bookings.html" className="avatar avatar-md flex-shrink-0">
                                                                <img className="avatar-img" src="/img/cars/car-08.jpg" alt="Booking" />
                                                            </a>
                                                            <div className="table-head-name flex-grow-1">
                                                                <a href="user-bookings.html">Toyota Tacoma 4WD</a>
                                                                <p>Rent Type : Weekly</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="border-0 text-end">
                                                        <span className="badge badge-light-danger">Cancelled</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="2" className="pt-0">
                                                        <div className="status-box">
                                                            <p><span>Status : </span>On 15 Sep 2023, 11:30 PM</p>
                                                        </div>
                                                    </td>
                                                </tr><tr>
                                                    <td className="border-0">
                                                        <div className="table-avatar">
                                                            <a href="user-bookings.html" className="avatar avatar-md flex-shrink-0">
                                                                <img className="avatar-img" src="/img/cars/car-01.jpg" alt="Booking" />
                                                            </a>
                                                            <div className="table-head-name flex-grow-1">
                                                                <a href="user-bookings.html">Ford Mustang 4.0 AT</a>
                                                                <p>Rent Type : Monthly</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="border-0 text-end">
                                                        <span className="badge badge-light-success">Completed</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="2" className="pt-0 pb-0 border-0">
                                                        <div className="status-box">
                                                            <p><span>Status : </span>On 20 Dec 2023, 05:20 PM</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* /Recent Transaction */}

                    </div>
                    {/* /Dashboard */}

                </div>
            </div>

            {/* <Footer /> */}
        </>
    )
};

export default TechnicianDashboard;
