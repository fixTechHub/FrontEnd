const steps = [
    { id: 1, label: "Vị trí & thời gian", icon: "/img/icons/booking-head-icon-01.svg" },
    { id: 2, label: "Chọn kỹ thuật viên", icon: "/img/icons/booking-head-icon-02.svg" },
    { id: 3, label: "Xem thông tin", icon: "/img/icons/booking-head-icon-03.svg" },
    { id: 4, label: "Thanh toán", icon: "/img/icons/booking-head-icon-04.svg" },
    { id: 5, label: "Xác nhận hoàn thành", icon: "/img/icons/booking-head-icon-05.svg" }
];

const BookingWizard = ({ activeStep }) => {
    return (
        <div className="booking-wizard-head">
            <div className="row align-items-center">
                <div>
                    <div className="booking-wizard-lists" style={{ justifyContent: "space-around" }}>
                        <ul>
                            {steps.map((step) => {
                                let className = "";
                                if (step.id < activeStep) {
                                    className = "active activated"; 
                                } else if (step.id === activeStep) {
                                    className = "active"; 
                                }

                                return (
                                    <li key={step.id} className={className}>
                                        <span><img src={step.icon} alt="Booking Icon" /></span>
                                        <h6>{step.label}</h6>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingWizard;
