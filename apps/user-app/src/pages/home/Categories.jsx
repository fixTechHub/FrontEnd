import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPublicCategories } from "../../features/categories/categorySlice";
import { Spinner } from "react-bootstrap";

function Categories() {
    const dispatch = useDispatch();
    const categories = useSelector((state) => state.categories.categories);
    const status = useSelector((state) => state.categories.status);

    console.log('--- CATEGORY ---', categories);

    // Sử dụng useRef để tránh double call từ StrictMode
    const hasFetched = useRef(false);
    const carouselInitialized = useRef(false);

    // console.log('Categories render:', { status, categoriesLength: categories?.length });

    // Effect để fetch data - CHỈ CHẠY 1 LẦN
    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            console.log('🚀 Fetching categories (first time only)');
            dispatch(fetchAllPublicCategories());
        }
    }, []); // Empty dependency array - chỉ chạy khi mount

    // Effect để khởi tạo Owl Carousel
    useEffect(() => {
        if (status === 'succeeded' && Array.isArray(categories) && categories.length > 0 && !carouselInitialized.current) {
            carouselInitialized.current = true;

            const timer = setTimeout(() => {
                console.log('🎠 Initializing Owl Carousel');

                const $carousel = $('.popular-cartype-slider');

                // Cleanup existing carousel nếu có
                if ($carousel.hasClass('owl-loaded')) {
                    $carousel.trigger('destroy.owl.carousel');
                    $carousel.removeClass('owl-carousel owl-loaded');
                    $carousel.find('.owl-stage-outer').children().unwrap();
                }

                // Khởi tạo carousel mới
                $carousel.addClass('owl-carousel').owlCarousel({
                    loop: true,
                    margin: 10,
                    nav: true,
                    dots: true,
                    autoplay: true,
                    autoplayTimeout: 3000,
                    responsive: {
                        0: { items: 1 },
                        600: { items: 2 },
                        1000: { items: 4 }
                    }
                });
            }, 200);

            // Cleanup function
            return () => {
                clearTimeout(timer);
                // Reset flag nếu component unmount
                carouselInitialized.current = false;
            };
        }
    }, [status, categories]);

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            console.log('💀 Categories component unmounting');
            hasFetched.current = false;
            carouselInitialized.current = false;

            // Destroy carousel khi unmount
            const $carousel = $('.popular-cartype-slider');
            if ($carousel.hasClass('owl-loaded')) {
                $carousel.trigger('destroy.owl.carousel');
            }
        };
    }, []);

    if (status === 'loading') {
        return (
            <>
                <Spinner animation="border" variant="warning" />
                <h6>Đang tải dữ liệu</h6>
            </>
        );
    }

    if (status === 'failed') {
        return (
            <div className="main-wrapper login-body">
                <section className="section popular-car-type">
                    <div className="container">
                        <div className="text-center">
                            <h6>Có lỗi xảy ra khi tải dữ liệu</h6>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (!Array.isArray(categories) || categories.length === 0) {
        return (
            <div className="main-wrapper login-body">
                <section className="section popular-car-type">
                    <div className="container">
                        <div className="text-center">
                            <h6>Không có dữ liệu danh mục</h6>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <>
            <div className="main-wrapper login-body">
                <section className="section popular-car-type">
                    <div className="container">
                        {/* Heading title */}
                        <div className="section-heading" data-aos="fade-down">
                            <h2>Danh Mục Nổi Bật</h2>
                            <p>Giải pháp sửa chữa nhanh chóng và chuyên nghiệp.</p>
                        </div>
                        {/* /Heading title */}

                        <div className="row">
                            <div className="popular-slider-group">
                                {/* <div className="owl-carousel popular-cartype-slider owl-theme"> */}
                                    {categories?.map((category) => (
                                        <div className="listing-owl-item"
                                            key={category._id}
                                            onClick={() => alert(`Đã chọn ${category.categoryName}`)}>
                                            <div className="listing-owl-group">
                                                <div className="listing-owl-img">
                                                    <img src="/img/cars/mp-vehicle-01.svg" className="img-fluid" alt="Popular Cartypes" />
                                                </div>
                                                <h6>{category.categoryName}</h6>
                                            </div>
                                        </div>
                                    ))}
                                {/* </div> */}
                            </div>
                        </div>

                        <div className="view-all text-center" data-aos="fade-down" data-aos-anchor-placement="top-bottom">
                            <a href="listing-grid.html" className="btn btn-view d-inline-flex align-items-center">
                                Xem tất cả danh mục
                                <span>
                                    <i className="feather-arrow-right ms-2"></i>
                                </span>
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default Categories;


// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchAllPublicCategories } from "../../features/categories/categorySlice";

// function Categories() {
//     const dispatch = useDispatch();
//     const categories = useSelector((state) => state.categories.categories);
//     const status = useSelector((state) => state.categories.status);
//     // console.log('--- CTER ---', categories);
//     console.log('status:', status);
//     console.log('categories:', categories);


//     useEffect(() => {
//         if (status === 'idle') {
//             console.log('🚀 Fetching categories (status is idle)');
//             dispatch(fetchAllPublicCategories());
//         }
//     }, [dispatch, status]);

//     if (status === 'loading')
//         return (
//             <h6>Đang tải dữ liệu</h6>
//         )

//     if (status === 'failed') return <h6>Lỗi tải danh mục</h6>;

//     return (
//         <>
//             <div className="main-wrapper login-body">
//                 <section className="section popular-car-type">
//                     <div className="container">
//                         {/* Heading title */}
//                         <div className="section-heading" data-aos="fade-down">
//                             <h2>Danh Mục Nổi Bật</h2>
//                             <p>Giải pháp sửa chữa nhanh chóng và chuyên nghiệp.</p>
//                         </div>
//                         {/* /Heading title */}

//                         <div className="row">
//                             <div className="popular-slider-group">
//                                 <div className="owl-carousel popular-cartype-slider owl-theme">
//                                     {Array.isArray(categories) && categories.length > 0 && categories.map((category) => (
//                                         <div className="listing-owl-item"
//                                             key={category._id} onClick={() => alert(`Đã chọn ${category.categoryName}`)}>
//                                             <div className="listing-owl-group">
//                                                 <div className="listing-owl-img">
//                                                     <img src="/img/cars/mp-vehicle-01.svg" className="img-fluid" alt="Popular Cartypes" />
//                                                 </div>
//                                                 <h6>{category.categoryName}</h6>
//                                                 {/* <p>35 Cars</p> */}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="view-all text-center" data-aos="fade-down" data-aos-anchor-placement="top-bottom">
//                             <a href="listing-grid.html" className="btn btn-view d-inline-flex align-items-center">
//                                 Xem tất cả danh mục
//                                 <span>
//                                     <i className="feather-arrow-right ms-2"></i>
//                                 </span>
//                             </a>
//                         </div>
//                     </div>
//                 </section>
//             </div>
//         </>
//     )
// }

// export default Categories;
