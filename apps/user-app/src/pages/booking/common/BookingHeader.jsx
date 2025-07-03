const BookingWizard = ({ steps, activeStep }) => {
    if (!steps || steps.length === 0) {
        return null;
    }

    return (
        <div className="booking-wizard-head">
            <div className="row align-items-center">

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
    );
};

export default BookingWizard;
