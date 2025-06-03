function BookingPage() {
    return (
        <>
            <div className="section-search">
                <div className="container">
                    <div className="search-box-banner">
                        <form action="https://dreamsrent.dreamstechnologies.com/html/template/listing-grid.html">
                            <ul className="align-items-center">
                                <li className="column-group-main">
                                    <div className="input-block">
                                        <label>Pickup Location</label>
                                        <div className="group-img">
                                            <input type="text" className="form-control" placeholder="Enter City, Airport, or Address" />
                                            <span>
                                                <i className="feather-map-pin"></i>
                                            </span>
                                        </div>
                                    </div>
                                </li>
                                <li className="column-group-main">
                                    <div className="input-block">
                                        <label>Pickup Date</label>
                                    </div>
                                    <div className="input-block-wrapp">
                                        <div className="input-block date-widget">
                                            <div className="group-img">
                                                <input type="text" className="form-control datetimepicker" placeholder="04/11/2023" />
                                                <span>
                                                    <i className="feather-calendar"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="input-block time-widge">
                                            <div className="group-img">
                                                <input type="text" className="form-control timepicker" placeholder="11:00 AM" />
                                                <span>
                                                    <i className="feather-clock"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li className="column-group-main">
                                    <div className="input-block">
                                        <label>Return Date</label>
                                    </div>
                                    <div className="input-block-wrapp">
                                        <div className="input-block date-widge">
                                            <div className="group-img">
                                                <input type="text" className="form-control datetimepicker" placeholder="04/11/2023" />
                                                <span>
                                                    <i className="feather-calendar"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="input-block time-widge">
                                            <div className="group-img">
                                                <input type="text" className="form-control timepicker" placeholder="11:00 AM" />
                                                <span>
                                                    <i className="feather-clock"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li className="column-group-last">
                                    <div className="input-block">
                                        <div className="search-btn">
                                            <button className="btn search-button" type="submit">
                                                <i className="fa fa-search" aria-hidden="true"></i>Search
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}