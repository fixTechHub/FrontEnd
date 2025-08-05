import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";

function ServiceList() {
    const { categories, status: categoryStatus } = useSelector((state) => state.categories);
    const { services, status: serviceStatus } = useSelector((state) => state.services);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);

    const filteredServices = services.filter(service => {
        const matchCategory =
            selectedCategories.length === 0 || selectedCategories.includes(service.categoryId);

        const matchSearch =
            !searchTerm || service.serviceName.toLowerCase().includes(searchTerm);

        return matchCategory && matchSearch;
    });

    const itemsPerPage = 6;

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentServices = filteredServices.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategories, searchTerm]);

    if (categoryStatus === 'loading' || serviceStatus === 'loading')
        return (
            <>
                <Spinner animation="border" variant="warning" />
                <h6>Đang tải dữ liệu</h6>
            </>
        );

    return (
        <>
            <Header />

            <BreadcrumbBar title={'Danh Sách Dịch Vụ'} subtitle={'Services List'} />

            <div className="main-wrapper listing-page mt-3  ">
                <div className="sort-section">
                    <div className="container">
                        <div className="sortby-sec">
                            <div className="sorting-div">
                                <div className="row d-flex align-items-center">
                                    <div className="col-xl-4 col-lg-3 col-sm-12 col-12">
                                        {/* <div className="count-search">
                                            <p>Showing 1-9 of 154 Cars</p>
                                        </div> */}
                                    </div>
                                    <div className="col-xl-8 col-lg-9 col-sm-12 col-12">
                                        <div className="product-filter-group">
                                            <div className="sortbyset">
                                                <ul>
                                                    <li>
                                                        <span className="sortbytitle">Sort By </span>
                                                        <div className="sorting-select select-two">
                                                            <select className="form-control select">
                                                                <option>Newest</option>
                                                                <option>Relevance</option>
                                                                <option>Best Rated</option>
                                                            </select>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="section car-listing pt-0">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-3 col-lg-4 col-sm-12 col-12 theiaStickySidebar">
                                <form action="#" autoComplete="off" className="sidebar-form">
                                    <div className="product-search">
                                        <div className="form-custom">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="member_search1"
                                                placeholder="Nhập để tìm kiếm"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                                            />

                                            <span><img src="/img/icons/search.svg" alt="Search" /></span>
                                        </div>
                                    </div>

                                    <div className="accord-list">
                                        <div className="accordion" id="accordionMain1">
                                            <div className="card-header-new" id="headingOne">
                                                <h6 className="filter-title">
                                                    <a href="javascript:void(0);" className="w-100" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                                        Danh mục
                                                        <span className="float-end"><i className="fa-solid fa-chevron-down"></i></span>
                                                    </a>
                                                </h6>
                                            </div>
                                            <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample1">
                                                <div className="card-body-chat">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <div id="checkBoxes1">
                                                                <div className="selectBox-cont">
                                                                    {categories.map((category) => (
                                                                        <label className="custom_check w-100">
                                                                            <input
                                                                                type="checkbox"
                                                                                name="categories"
                                                                                value={category._id}
                                                                                checked={selectedCategories.includes(category._id)}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;
                                                                                    setSelectedCategories((prev) =>
                                                                                        prev.includes(value)
                                                                                            ? prev.filter((id) => id !== value)
                                                                                            : [...prev, value]
                                                                                    );
                                                                                }}
                                                                            />
                                                                            <span className="checkmark"></span>  {category.categoryName}
                                                                        </label>
                                                                    ))}

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <button type="submit" className="d-inline-flex align-items-center justify-content-center btn w-100 btn-primary filter-btn">
                                        <span><i className="feather-filter me-2"></i></span>Filter results
                                    </button>
                                    <a href="#" className="reset-filter">Reset Filter</a> */}
                                </form>
                            </div>

                            <div className="col-lg-9">
                                <div className="row">
                                    {currentServices.length === 0 ? (
                                        <div className="col-12 text-center py-5">
                                            <h5>Không tìm thấy dịch vụ phù hợp.</h5>
                                        </div>
                                    ) : (
                                        currentServices.map((service) => (
                                            <div className="col-xxl-4 col-lg-6 col-md-6 col-12">
                                                <div className="listing-item">
                                                    <div className="listing-img">
                                                        <a href="listing-details.html">
                                                            <img src="/img/cars/car-03.jpg" className="img-fluid" alt="Audi" />
                                                        </a>
                                                    </div>

                                                    <div className="listing-content">
                                                        <div className="listing-features d-flex align-items-end justify-content-between"
                                                            style={{ paddingBottom: 5, marginBottom: 8 }}
                                                        >
                                                            <div className="list-rating">
                                                                <h3 className="listing-title">
                                                                    <a href="listing-details.html"
                                                                        title={service?.serviceName}
                                                                    >{service?.serviceName}</a>
                                                                </h3>
                                                                {/* <div className="list-rating">
                                                            <>Loại dịch vụ: <>Đơn giản</></>
                                                        </div> */}
                                                            </div>
                                                        </div>

                                                        <div className="listing-details-group two-line-ellipsis" title={service?.description}>
                                                            <p>{service?.description}</p>
                                                        </div>

                                                        {service?.embedding && service.embedding.length > 0 && (
                                                            <div className="listing-details-group">
                                                                <p><small>AI Embedding: {service.embedding.length} dimensions</small></p>
                                                            </div>
                                                        )}

                                                        <div className="listing-details-group">
                                                            <p><small>Cập nhật: {service?.updatedAt ? new Date(service.updatedAt).toLocaleDateString() : 'Chưa cập nhật'}</small></p>
                                                        </div>

                                                        <div className="listing-location-details" style={{ marginTop: 30 }}>
                                                            <div className="listing-price">
                                                                <span>
                                                                    <i className="feather-map-pin"></i>
                                                                </span>
                                                                Mức Giá
                                                            </div>

                                                            <div className="listing-price">
                                                                <h6><span>Liên hệ</span></h6>
                                                            </div>
                                                        </div>

                                                        <div className="button-container">
                                                            <button href="listing-details.html" className="custom-button"
                                                                onClick={() => navigate(`/booking?serviceId=${service?._id}&type=scheduled`)}
                                                            >
                                                                <i className="feather-calendar me-2"></i>
                                                                Đặt Lịch
                                                            </button>
                                                            <button href="contact.html" className="custom-button-secondary"
                                                                onClick={() => navigate(`/booking?serviceId=${service?._id}&type=urgent`)}
                                                            >
                                                                <i className="feather-calendar me-2"></i>
                                                                Đặt Ngay
                                                            </button>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        )))}

                                </div>

                                <div className="blog-pagination">
                                    <nav>
                                        <ul className="pagination page-item justify-content-center">
                                            {/* <li className="previtem">
                                                <a className="page-link" href="#">
                                                    <i className="fas fa-regular fa-arrow-left me-2"></i> Prev
                                                </a>
                                            </li> */}
                                            <li className={`previtem ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <a className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                                    <i className="fas fa-regular fa-arrow-left"></i>
                                                </a>
                                            </li>

                                            <li className="justify-content-center pagination-center">
                                                <div className="page-group">
                                                    <ul>
                                                        {[...Array(totalPages)].map((_, index) => (
                                                            <li key={index} className="page-item">
                                                                <a
                                                                    className={`${currentPage === index + 1 ? 'active page-link' : 'page-link'}`}
                                                                    onClick={() => handlePageChange(index + 1)}>
                                                                    {index + 1}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </li>

                                            <li className={`nextlink ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <a className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                                    <i className="fas fa-regular fa-arrow-right"></i>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>

                            </div>

                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default ServiceList;
