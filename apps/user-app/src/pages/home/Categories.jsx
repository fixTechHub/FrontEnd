import { useSelector } from "react-redux";

function Categories() {
    const categories = useSelector((state) => state.categories.topCategories);
    const status = useSelector((state) => state.categories.status);
    console.log('--- CTER ---', categories);

    if (status === 'loading')
        return (
            <h6>Đang tải dữ liệu</h6>
        )

    if (status === 'failed') return <h6>Lỗi tải danh mục</h6>;

    return (
        <>
            <section className="yacht-category-sec section popular-car-type">
                <div className="sec-bg">
                    <img src="/img/bg/yacht-cat-sec-bg-01.png" className="anchor-img" alt="Background Anchor" />
                    <img src="/img/bg/yacht-cat-sec-bg-02.png" className="vector-round" alt="Background Vector Round" />
                    <img src="/img/bg/yacht-cat-sec-bg-03.png" className="design-round" alt="Background Design Round" />
                </div>
                <div className="sec-round-colors">
                    <span className="bg-orange round-small"></span>
                    <span className="bg-orange round-small"></span>
                    <span className="bg-dark-blue round-small"></span>
                    <span className="bg-dark-blue round-small"></span>
                </div>
                <div className="container">
                    <div className="section-heading" data-aos="fade-down">
                        <h2>Danh Mục Nổi Bật</h2>
                        <p>Khám phá những danh mục sản phẩm được yêu thích và tìm kiếm nhiều nhất</p>
                    </div>

                    <div className="row yacht-category-lists">
                        {Array.isArray(categories) && categories.length > 0 && categories.map((category) => (
                            <div className="custom-col" key={category._id || category.categoryName} onClick={() => alert(`Đã chọn ${category.categoryName}`)}>
                                <div className="yacht-cat-grid">
                                    <div className="yatch-card-img">
                                        <a href="listing-grid.html"><img src="/img/yacht/yacht-01.jpg" className="img-fluid" alt="Motor Yacht" /></a>
                                    </div>
                                    <div className="card-content d-flex align-items-center justify-content-between">
                                        <div>
                                            <h4><div
                                                className="category-title"
                                                title={category.categoryName}>
                                                {category.categoryName}</div></h4>
                                            <span>Tổng dịch vụ: {category.serviceCount}</span>
                                        </div>
                                        <a href="listing-grid.html" className="arrow-right"><i className="bx bx-right-arrow-alt"></i></a>
                                    </div>
                                </div>
                            </div>
                        ))}
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
        </>
    )
}

export default Categories;
