function Menu() {
    return (
        <>
            <div className="dashboard-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="dashboard-menu">
                                <ul>
                                    <li>
                                        <a href="user-dashboard.html" className="active">
                                            <img src="/img/icons/dashboard-icon.svg" alt="Icon" />
                                            <span>Dashboard</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="user-bookings.html">
                                            <img src="/img/icons/booking-icon.svg" alt="Icon" />
                                            <span>My Bookings</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="user-reviews.html">
                                            <img src="/img/icons/review-icon.svg" alt="Icon" />
                                            <span>Reviews</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="user-wishlist.html">
                                            <img src="/img/icons/wishlist-icon.svg" alt="Icon" />
                                            <span>Wishlist</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="user-messages.html">
                                            <img src="/img/icons/message-icon.svg" alt="Icon" />
                                            <span>Messages</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="user-wallet.html">
                                            <img src="/img/icons/wallet-icon.svg" alt="Icon" />
                                            <span>My Wallet</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="user-payment.html">
                                            <img src="/img/icons/payment-icon.svg" alt="Icon" />
                                            <span>Payments</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="user-settings.html">
                                            <img src="/img/icons/settings-icon.svg" alt="Icon" />
                                            <span>Settings</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default Menu;