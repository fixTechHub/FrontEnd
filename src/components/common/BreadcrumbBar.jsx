const BreadcrumbBar = ({ title }) => {
    return (
        <div className="breadcrumb-bar">
            <div className="container">
                <div className="row align-items-center text-center">
                    <div className="col-md-12 col-12">
                        <h2 className="breadcrumb-title">{title}</h2>
                        <ol className="breadcrumb">
                            {/* <li className="breadcrumb-item">
                                <a href="index.html">Home</a>
                            </li> */}
                            <li className="breadcrumb-item active" aria-current="page">
                                *** Create Your Booking Service ***
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BreadcrumbBar;
