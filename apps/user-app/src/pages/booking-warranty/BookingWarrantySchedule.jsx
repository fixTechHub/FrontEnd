import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { proposeWarrantyScheduleThunk, confirmWarrantyScheduleThunk } from "../../features/booking-warranty/warrantySlice"; // Adjust path
import { formatDate } from "../../utils/formatDate";

function BookingWarrantySchedule({ bookingWarrantyId, onWarrantyUpdated }) {
    const dispatch = useDispatch();
    const { warranty, loadingSchedule, error } = useSelector((state) => state.warranty);
    const { user } = useSelector((state) => state.auth);
    const [showProposeModal, setShowProposeModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [proposedDate, setProposedDate] = useState("");
    const [proposedTime, setProposedTime] = useState("");
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [expectedEndDate, setExpectedEndDate] = useState("");
    const [expectedEndTime, setExpectedEndTime] = useState("");

    const isCustomer = user?.role?.name === "CUSTOMER";
    const isTechnician = user?.role?.name === "TECHNICIAN";

    // Get current date and calculate tomorrow as the minimum date
    const today = new Date("2025-07-20T00:08:00+07:00"); // Current date and time
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0]; // e.g., "2025-07-21"

    const validateDateTime = (date, time) => {
        if (!date || !time) return false;
        const selectedDateTime = new Date(`${date}T${time}:00+07:00`);
        return selectedDateTime >= tomorrow;
    };

   

    const handleProposeSchedule = async (e) => {
        e.preventDefault();
        if (!proposedDate || !proposedTime) {
            toast.error("Vui lòng chọn cả ngày và giờ đề xuất!", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        if (!validateDateTime(proposedDate, proposedTime)) {
            toast.error("Ngày và giờ đề xuất phải từ ngày mai trở đi!", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        const proposedDateTime = `${proposedDate}T${proposedTime}:00+07:00`;
        try {
            await dispatch(proposeWarrantyScheduleThunk({ bookingWarrantyId, proposedSchedule: proposedDateTime })).unwrap();
            toast.success("Đề xuất lịch bảo hành thành công!", {
                position: "top-right",
                autoClose: 5000,
            });
            setShowProposeModal(false);
            setProposedDate("");
            setProposedTime("");
            if (onWarrantyUpdated) onWarrantyUpdated();
        } catch (error) {
            toast.error(`Lỗi khi đề xuất lịch: ${error?.message || error || "Đã xảy ra lỗi"}`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const handleConfirmSchedule = async (e) => {
        e.preventDefault();
     

        if (!startDate || !startTime || !expectedEndDate || !expectedEndTime) {
            toast.error("Vui lòng cung cấp đầy đủ ngày và giờ bắt đầu cũng như kết thúc!", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        if (!validateDateTime(startDate, startTime)) {
            toast.error("Thời gian bắt đầu phải từ ngày mai trở đi!", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }
        const startDateTime = new Date(`${startDate}T${startTime}:00+07:00`);
      
        const endDateTime = new Date(`${expectedEndDate}T${expectedEndTime}:00+07:00`);
        if (endDateTime <= startDateTime) {
            toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!", {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        try {
            await dispatch(confirmWarrantyScheduleThunk({ bookingWarrantyId, data: { startTime: startDateTime.toISOString(),expectedEndTime: endDateTime.toISOString() } })).unwrap();
            toast.success("Xác nhận lịch bảo hành thành công!", {
                position: "top-right",
                autoClose: 5000,
            });
            setShowConfirmModal(false);
            setStartDate("");
            setStartTime("");
            setExpectedEndDate("");
            setExpectedEndTime("");
            if (onWarrantyUpdated) onWarrantyUpdated();
        } catch (error) {
            toast.error(error.message , {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const styles = {
        sidebar: {
            width: "100%",
        },
        sidebarCard: {
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#fff",
            marginBottom: "20px",
        },
        sidebarHead: {
            padding: "15px 20px",
            borderBottom: "1px solid #eee",
            backgroundColor: "#f8f9fa",
        },
        sidebarHeadH5: {
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#333",
        },
        sidebarBody: {
            padding: "20px",
        },
        loadingText: {
            color: "#007bff",
            fontStyle: "italic",
            fontSize: "1rem",
        },
        errorText: {
            color: "#dc3545",
            fontSize: "1rem",
        },
        scheduleList: {
            listStyle: "none",
            padding: 0,
            margin: "0 0 20px 0",
        },
        scheduleItem: {
            display: "flex",
            justifyContent: "space-between",
            padding: "14px 0",
            borderBottom: "1px solid #e9ecef",
            fontSize: "1.05rem",
        },
        detailLabel: {
            fontWeight: 600,
            color: "#343a40",
            flex: "0 0 40%",
        },
        detailValue: {
            color: "#495057",
            flex: "0 0 58%",
            wordBreak: "break-word",
        },
        modalContent: {
            borderRadius: "12px",
            boxShadow: "0 6px 25px rgba(0, 0, 0, 0.15)",
            border: "none",
            background: "#fff",
        },
        modalHeader: {
            background: "linear-gradient(135deg, #090909 0%, #181818 100%)",
            color: "#fff",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        modalTitle: {
            fontSize: "1.6rem",
            fontWeight: 600,
            margin: 0,
        },
        closeBtn: {
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "1.6rem",
            cursor: "pointer",
            transition: "color 0.2s ease",
        },
        closeBtnHover: {
            color: "#f8f9fa",
        },
        modalBody: {
            padding: "24px 30px",
            background: "#f8f9fa",
        },
        formGroup: {
            marginBottom: "20px",
        },
        formLabel: {
            fontSize: "1rem",
            fontWeight: 600,
            color: "#343a40",
            marginBottom: "8px",
            display: "block",
        },
        input: {
            width: "100%",
            padding: "12px",
            border: "1px solid #ced4da",
            borderRadius: "8px",
            fontSize: "1rem",
            transition: "border-color 0.2s ease",
        },
        inputFocus: {
            outline: "none",
            borderColor: "#007bff",
            boxShadow: "0 0 5px rgba(0, 123, 255, 0.3)",
        },
        btnGroup: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "15px",
            marginTop: "20px",
        },
        btn: {
            padding: "10px 20px",
            fontSize: "1rem",
            fontWeight: 500,
            borderRadius: "8px",
            transition: "background-color 0.2s ease, transform 0.1s ease",
        },
      
        
    };

    return (
        <>
            <div style={styles.sidebar} className="booking-sidebar">
                <div style={styles.sidebarCard} className="booking-sidebar-card">
                    <div style={styles.sidebarHead} className="booking-sidebar-head">
                        <h5 style={styles.sidebarHeadH5}>Lịch bảo hành</h5>
                    </div>
                    <div style={styles.sidebarBody} className="booking-sidebar-body">
                        {loadingSchedule.propose && <p style={styles.loadingText}>Đang tải...</p>}
                        {loadingSchedule.confirm && <p style={styles.loadingText}>Đang tải...</p>}
                        {!loadingSchedule.propose && !loadingSchedule.confirm && !error && warranty && (
                            <ul style={styles.scheduleList}>
                                {warranty.proposedSchedule && (
                                    <li style={styles.scheduleItem}>
                                        <span style={styles.detailLabel}>Lịch đề xuất:</span>
                                        <span style={styles.detailValue}>
                                            {formatDate(warranty.proposedSchedule) || "Không có dữ liệu"}
                                        </span>
                                    </li>
                                )}
                                {warranty.confirmedSchedule && (
                                    <>
                                        <li style={styles.scheduleItem}>
                                            <span style={styles.detailLabel}>Thời gian bắt đầu:</span>
                                            <span style={styles.detailValue}>
                                                {formatDate(warranty.confirmedSchedule.startTime) || "Không có dữ liệu"}
                                            </span>
                                        </li>
                                        <li style={styles.scheduleItem}>
                                            <span style={styles.detailLabel}>Thời gian kết thúc dự kiến:</span>
                                            <span style={styles.detailValue}>
                                                {formatDate(warranty.confirmedSchedule.expectedEndTime) || "Không có dữ liệu"}
                                            </span>
                                        </li>
                                    </>
                                )}
                            </ul>
                        )}
                        {isCustomer && warranty?.status === "CONFIRMED" && !warranty.proposedSchedule && (
                            <Button
                                style={{ ...styles.btn, ...styles.btnPrimary }}
                                onClick={() => setShowProposeModal(true)}
                                disabled={loadingSchedule.propose}
                                onMouseOver={(e) => Object.assign(e.target.style, styles.btnPrimaryHover)}
                                onMouseOut={(e) => Object.assign(e.target.style, styles.btnPrimary)}
                            >
                                Đề xuất lịch bảo hành
                            </Button>
                        )}
                        {isTechnician && warranty?.status === "CONFIRMED" && warranty.proposedSchedule  && !warranty.confirmedSchedule &&  (
                            <Button
                                style={{ ...styles.btn, ...styles.btnPrimary }}
                                onClick={() => setShowConfirmModal(true)}
                                disabled={loadingSchedule.confirm}
                                onMouseOver={(e) => Object.assign(e.target.style, styles.btnPrimaryHover)}
                                onMouseOut={(e) => Object.assign(e.target.style, styles.btnPrimary)}
                            >
                                Xác nhận lịch bảo hành
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Propose Schedule Modal */}
            <Modal
                show={showProposeModal}
                onHide={() => {
                    setShowProposeModal(false);
                    setProposedDate("");
                    setProposedTime("");
                }}
                centered
                size="md"
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header style={styles.modalHeader}>
                    <Modal.Title style={styles.modalTitle}>Đề xuất lịch bảo hành</Modal.Title>
                    <Button
                        style={styles.closeBtn}
                        onClick={() => {
                            setShowProposeModal(false);
                            setProposedDate("");
                            setProposedTime("");
                        }}
                        onMouseOver={(e) => Object.assign(e.target.style, styles.closeBtnHover)}
                        onMouseOut={(e) => Object.assign(e.target.style, styles.closeBtn)}
                    >
                        <span>×</span>
                    </Button>
                </Modal.Header>
                <Modal.Body style={styles.modalBody}>
                    <Form onSubmit={handleProposeSchedule}>
                        <div style={styles.formGroup}>
                            <Form.Label style={styles.formLabel}>Ngày đề xuất <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="date"
                                style={styles.input}
                                value={proposedDate}
                                min={minDate}
                                onChange={(e) => setProposedDate(e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <Form.Label style={styles.formLabel}>Giờ đề xuất <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="time"
                                style={styles.input}
                                value={proposedTime}
                                onChange={(e) => setProposedTime(e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                                required
                            />
                        </div>
                        <div style={styles.btnGroup}>
                            <Button
                                onClick={() => {
                                    setShowProposeModal(false);
                                    setProposedDate("");
                                    setProposedTime("");
                                }}
                               
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loadingSchedule.propose}
                               
                            >
                                {loadingSchedule.propose ? "Đang xử lý..." : "Xác nhận"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Confirm Schedule Modal */}
            <Modal
                show={showConfirmModal}
                onHide={() => {
                    setShowConfirmModal(false);
                    setStartDate("");
                    setStartTime("");
                    setExpectedEndDate("");
                    setExpectedEndTime("");
                }}
                centered
                size="md"
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header style={styles.modalHeader}>
                    <Modal.Title style={styles.modalTitle}>Xác nhận lịch bảo hành</Modal.Title>
                    <Button
                        style={styles.closeBtn}
                        onClick={() => {
                            setShowConfirmModal(false);
                       
                            setExpectedEndDate("");
                            setExpectedEndTime("");
                        }}
                        onMouseOver={(e) => Object.assign(e.target.style, styles.closeBtnHover)}
                        onMouseOut={(e) => Object.assign(e.target.style, styles.closeBtn)}
                    >
                        <span>×</span>
                    </Button>
                </Modal.Header>
                <Modal.Body >
                    <Form onSubmit={handleConfirmSchedule}>
                    <div style={styles.formGroup}>
                            <Form.Label style={styles.formLabel}>Ngày bắt đầu <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="date"
                                style={styles.input}
                                value={startDate}
                                min={minDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <Form.Label style={styles.formLabel}>Giờ bắt đầu <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="time"
                                style={styles.input}
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                                required
                            />
                        </div>
                      
                        <div style={styles.formGroup}>
                            <Form.Label style={styles.formLabel}>Ngày kết thúc dự kiến <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="date"
                                style={styles.input}
                                value={expectedEndDate}
                                min={minDate}
                                onChange={(e) => setExpectedEndDate(e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <Form.Label style={styles.formLabel}>Giờ kết thúc dự kiến <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="time"
                                style={styles.input}
                                value={expectedEndTime}
                                onChange={(e) => setExpectedEndTime(e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                onBlur={(e) => Object.assign(e.target.style, styles.input)}
                                required
                            />
                        </div>
                        <div >
                            <Button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setStartDate("");
                                    setStartTime("");
                                    setExpectedEndDate("");
                                    setExpectedEndTime("");
                                }}
                            
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loadingSchedule.confirm}
                             
                            >
                                {loadingSchedule.confirm ? "Đang xử lý..." : "Xác nhận"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default BookingWarrantySchedule;