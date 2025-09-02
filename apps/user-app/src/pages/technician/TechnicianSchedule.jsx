// src/pages/technician/TechnicianScheduleComponent.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { fetchScheduleByTechnicianId } from '../../features/technicians/technicianSlice';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    format,
    isSameDay,
    isSameMonth,
    startOfDay,
    endOfDay,
    parseISO,
    isWithinInterval,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const TechnicianScheduleComponent = () => {
    const dispatch = useDispatch();
    const { schedule = [], status, error } = useSelector((s) => s.technician);
    const { technician } = useSelector((s) => s.auth);

    const technicianId = technician?._id;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // fetch lịch
    useEffect(() => {
        if (technicianId) dispatch(fetchScheduleByTechnicianId(technicianId));
    }, [dispatch, technicianId]);

    // debug 1 lần để soi data thời gian
    useEffect(() => {
        if (Array.isArray(schedule) && schedule.length) {
            // eslint-disable-next-line no-console
            console.table(
                schedule.map((s) => ({
                    _id: s._id,
                    type: s.scheduleType,
                    startTime: s.startTime,
                    endTime: s.endTime,
                }))
            );
        }
    }, [schedule]);

    const monthLabel = useMemo(
        () => format(currentDate, 'MMMM yyyy', { locale: vi }),
        [currentDate]
    );

    const goPrev = () => setCurrentDate((d) => addDays(startOfMonth(d), -1));
    const goNext = () => setCurrentDate((d) => addDays(endOfMonth(d), 1));
    const goToday = () => setCurrentDate(new Date());

    const parseDateSafe = (v) => (typeof v === 'string' ? parseISO(v) : new Date(v));

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows = [];
        let day = startDate;

        while (day <= endDate) {
            const cells = [];
            for (let i = 0; i < 7; i++) {
                const inThisMonth = isSameMonth(day, currentDate);
                const today = isSameDay(day, new Date());
                const dayStart = startOfDay(day);
                const dayEnd = endOfDay(day);

                // lọc theo khoảng ngày (tránh lệch timezone)
                const daySchedules = (Array.isArray(schedule) ? schedule : []).filter((item) => {
                    if (!item?.startTime) return false;
                    const st = parseDateSafe(item.startTime);
                    if (isNaN(st)) return false;
                    return isWithinInterval(st, { start: dayStart, end: dayEnd });
                });

                cells.push(
                    <div
                        key={day.toISOString()}
                        className={`tsc-cell ${inThisMonth ? '' : 'tsc-cell--muted'} ${today ? 'tsc-cell--today' : ''}`}
                    >
                        <div className="tsc-date">{format(day, 'd')}</div>

                        <div className="tsc-events">
                            {daySchedules.length === 0 && <div className="tsc-empty">—</div>}

                            {daySchedules.map((s) => {
                                const st = parseDateSafe(s.startTime);
                                const et = s.endTime ? parseDateSafe(s.endTime) : null;
                                const start = isNaN(st) ? '' : format(st, 'HH:mm');
                                const end = et && !isNaN(et) ? format(et, 'HH:mm') : '';

                                const kind = (s.scheduleType || '').toUpperCase();
                                const badgeClass =
                                    kind === 'BOOKING'
                                        ? 'tsc-badge tsc-badge--booking'
                                        : kind === 'WARRANTY'
                                            ? 'tsc-badge tsc-badge--warranty'
                                            : 'tsc-badge';

                                return (
                                    <button
                                        key={s._id}
                                        className={`tsc-event ${badgeClass}`}
                                        title={`${start}${end ? ' → ' + end : ''}`}
                                        onClick={() => {
                                            setSelectedSchedule(s);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        {start && <span className="tsc-time">{start}</span>}
                                        {end && <>
                                            <span className="tsc-sep">→</span>
                                            <span className="tsc-time">{end}</span>
                                        </>}
                                        <span className="tsc-kind">
                                            {kind === 'BOOKING' ? ' Đơn' : kind === 'WARRANTY' ? '  BH' : ''}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

                day = addDays(day, 1);
            }

            rows.push(
                <div key={day.toISOString()} className="tsc-row">
                    {cells}
                </div>
            );
        }

        return <div className="tsc-grid">{rows}</div>;
    };

    if (status === 'loading') return <div>Đang tải lịch...</div>;
    if (status === 'failed') return <div style={{ color: 'red' }}>Lỗi: {error}</div>;

    return (
        <div className="main-wrapper">
            {/* Styles scoped cho component */}
            <style>{`
        :root {
          --border:#e5e7eb; --soft:#f8fafc; --text:#0f172a; --muted:#64748b;
          --today:#fb923c;  --booking:#2563eb; /* xanh biển đậm */
        --warranty:#f97316; /* cam đậm */
        }
        .tsc-wrap{ max-width:1200px; margin:0 auto; padding:16px; }
        .tsc-card{ background:#fff; border:1px solid var(--border); border-radius:16px; box-shadow:0 8px 24px rgba(16,24,40,.06); overflow:hidden; }

        .tsc-head{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px; border-bottom:1px solid var(--border); background:linear-gradient(180deg,#fff, #fbfbfd); }
        .tsc-title{ margin:0; font-weight:800; font-size:20px; color:var(--text); letter-spacing:.2px; }
        .tsc-controls{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .tsc-btn{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid var(--border); border-radius:10px; background:#fff; cursor:pointer; font-weight:600; color:#111827; }
        .tsc-btn:hover{ background:#f3f6fb; }
        .tsc-btn--primary{ background:#111827; color:#fff; border-color:#111827; }
        .tsc-btn--primary:hover{ opacity:.9; }

        .tsc-subbar{ display:flex; align-items:center; justify-content:space-between; padding:10px 16px; border-bottom:1px solid var(--border); background:#fff; }
        .tsc-month{ font-weight:700; color:#0f172a; }
        .tsc-legend{ display:flex; gap:8px; align-items:center; font-size:12px; color:var(--muted); }
        .tsc-dot{ width:10px; height:10px; border-radius:999px; display:inline-block; }
        .tsc-dot--booking{ background:var(--booking); }
        .tsc-dot--warranty{ background:var(--warranty); }

        .tsc-week{ display:grid; grid-template-columns:repeat(7,1fr); text-align:center; background:#fff7ed; color:#9a3412; font-weight:700; border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
        .tsc-week > div{ padding:10px 0; }

        .tsc-grid{ border-bottom:1px solid var(--border); }
        .tsc-row{ display:grid; grid-template-columns:repeat(7,1fr); background:#d1d5db; gap:1px; }
        .tsc-cell{ background:#fff; min-height:130px; position:relative; padding:8px; transition:background .15s; }
        .tsc-cell:hover{ background:#f9fafb; }
        .tsc-cell--muted{ background:#f5f7fb; color:#94a3b8; }
        .tsc-cell--today{ outline:2px solid var(--today); outline-offset:-2px; }

        .tsc-date{ position:absolute; top:6px; left:8px; font-size:12px; font-weight:700; color:#111827; }
        .tsc-events{ margin-top:18px; display:flex; flex-direction:column; gap:6px; }
        .tsc-empty{ color:#cbd5e1; font-size:12px; }

        .tsc-event{ text-align:left; border:none; cursor:pointer; border-radius:8px; padding:6px 8px; line-height:1; display:flex; align-items:center; gap:6px; background:#eff6ff; transition:transform .05s ease; }
        .tsc-event:active{ transform:scale(0.99); }
        .tsc-badge--booking {
  background:rgba(37, 99, 235, 0.15); /* xanh biển nhạt */
}
.tsc-badge--warranty {
  background:rgba(249, 115, 22, 0.15); /* cam nhạt */
}
        .tsc-time{ font-weight:800; font-size:12px; }
        .tsc-sep{ opacity:.65; font-size:12px; }
        .tsc-kind{ color:#475569; font-size:12px; font-weight:700; }

        /* ===== Modal (new) ===== */
.tsc-modal-backdrop{
  position:fixed; inset:0;
  background:rgba(15,23,42,.48); /* tối hơn */
  backdrop-filter: blur(2px);
  display:flex; align-items:center; justify-content:center;
  z-index:1000; padding:20px;
  animation:fadeIn .15s ease-out;
}
.tsc-modal{
  width:100%; max-width:640px;
  background:#ffffff; border:1px solid #e6eaf2;
  border-radius:16px; overflow:hidden;
  box-shadow:0 30px 80px rgba(2,6,23,.25);
  transform: scale(.98); opacity:0;
  animation:popIn .18s ease-out forwards;
}
.tsc-modal__head{
  position:sticky; top:0; z-index:1;
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 18px; background:linear-gradient(180deg,#fff,#fafbff);
  border-bottom:1px solid #eef2f7;
}
.tsc-modal__title{ margin:0; font-size:18px; font-weight:800; color:#0f172a; }
.tsc-close{
  width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center;
  border:1px solid #e6eaf2; border-radius:999px; background:#fff; cursor:pointer;
}
.tsc-close:hover{ background:#f3f6fb; }

.tsc-modal__body{
  padding:18px; color:#0f172a;
}
.tsc-kv{ display:flex; gap:8px; margin:10px 0; }
.tsc-k{ width:160px; color:#64748b; }
.tsc-v{ flex:1; font-weight:600; }

.tsc-modal__foot{
  position:sticky; bottom:0; z-index:1;
  display:flex; justify-content:flex-end; gap:8px;
  padding:14px 18px; background:#fff; border-top:1px solid #eef2f7;
}
.tsc-btn{ display:inline-flex; align-items:center; gap:8px; padding:10px 14px;
  border:1px solid #e5e7eb; border-radius:10px; background:#fff; cursor:pointer; font-weight:700; }
.tsc-btn:hover{ background:#f3f6fb; }
.tsc-btn--primary{ background:#111827; color:#fff; border-color:#111827; }
.tsc-btn--primary:hover{ opacity:.9; }

/* animations */
@keyframes fadeIn{ from{opacity:0} to{opacity:1} }
@keyframes popIn{ to{transform:scale(1); opacity:1} }

/* mobile tweaks */
@media (max-width: 480px){
  .tsc-k{ width:120px; }
  .tsc-modal{ max-width: 92vw; }
}

      `}</style>

            <Header />
            <BreadcrumbBar />

            {/* Menu dashboard */}
            <div className="dashboard-section">
                <div className="container">
                    <div className="row"><div className="col-lg-12">
                        <div className="dashboard-menu">
                            <ul>
                                <li><Link to={`/technician`}><img src="/img/icons/dashboard-icon.svg" alt="Icon" /><span>Bảng điều khiển</span></Link></li>
                                <li><Link to={`/technician/booking`}><img src="/img/icons/booking-icon.svg" alt="Icon" /><span>Đơn hàng</span></Link></li>
                                <li><Link to="/technician/feedback"><img src="/img/icons/review-icon.svg" alt="Icon" /><span>Đánh giá</span></Link></li>
                                <li>
                                    <Link to={`/technician/${technicianId}/certificate`}>
                                        <img style={{ height: '28px' }} src="/img/cer.png" alt="Icon" />
                                        <span>Chứng chỉ</span>
                                    </Link>
                                </li>
                                <li><Link to="/technician/schedule" className="active"><img src="/img/icons/booking-icon.svg" alt="Icon" /><span>Lịch trình</span></Link></li>
                                <li><Link to="/technician/deposit"><img src="/img/icons/wallet-icon.svg" alt="Icon" /><span>Ví của tôi</span></Link></li>
                                <li><Link to={`/technician/earning`}><img src="/img/icons/payment-icon.svg" alt="Icon" /><span>Thu nhập</span></Link></li>
                                 <li><Link to={`/technician/warranty`}><img style={{ height: '28px' }} src="/img/icons/service-07.svg" alt="Icon" /><span>Bảo hành</span></Link></li>
                                {/* <li><Link to={`/profile`}><img src="/img/icons/settings-icon.svg" alt="Icon" /><span>Cài đặt</span></Link></li> */}
                            </ul>
                        </div>
                    </div></div>
                </div>
            </div>

            <div className="tsc-wrap">
                <div className="tsc-card">
                    {/* Header controls */}
                    <div className="tsc-head">
                        <h4 className="tsc-title">Lịch làm việc</h4>
                        <div className="tsc-controls">
                            <button className="tsc-btn" onClick={goPrev}>‹ Tháng trước</button>
                            <button className="tsc-btn" onClick={goToday}>Hôm nay</button>
                            <button className="tsc-btn" onClick={goNext}>Tháng sau ›</button>

                        </div>
                    </div>

                    {/* Subbar */}
                    <div className="tsc-subbar">
                        <div className="tsc-month">{monthLabel}</div>
                        <div className="tsc-legend">
                            <span className="tsc-dot tsc-dot--booking" /> Booking
                            <span className="tsc-dot tsc-dot--warranty" /> Bảo hành
                        </div>
                    </div>

                    {/* Week header */}
                    <div className="tsc-week">
                        <div>Th 2</div><div>Th 3</div><div>Th 4</div><div>Th 5</div><div>Th 6</div><div>Th 7</div><div>CN</div>
                    </div>

                    {/* Calendar grid */}
                    {renderCalendar()}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && selectedSchedule && (
                <div className="tsc-modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="tsc-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="tsc-modal__head">
                            <h5 className="tsc-modal__title">Chi tiết lịch</h5>
                            {/* đổi tsc-btn -> tsc-close */}
                            <button className="tsc-close" aria-label="Đóng" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <div className="tsc-modal__body">
                            <div className="tsc-kv"><div className="tsc-k">Loại lịch</div><div className="tsc-v">{selectedSchedule.scheduleType}</div></div>
                            <div className="tsc-kv"><div className="tsc-k">Bắt đầu</div><div className="tsc-v">{format(new Date(selectedSchedule.startTime), 'yyyy-MM-dd HH:mm')}</div></div>
                            <div className="tsc-kv"><div className="tsc-k">Kết thúc</div><div className="tsc-v">{selectedSchedule.endTime ? format(new Date(selectedSchedule.endTime), 'yyyy-MM-dd HH:mm') : '—'}</div></div>
                            <div className="tsc-kv"><div className="tsc-k">Ghi chú</div><div className="tsc-v">{selectedSchedule.note || '—'}</div></div>

                            {selectedSchedule.scheduleType === 'BOOKING' && selectedSchedule.bookingId && (
                                <>
                                    <hr />
                                    <div className="tsc-kv"><div className="tsc-k">Mã đặt lịch</div><div className="tsc-v">{selectedSchedule.bookingId.bookingCode || selectedSchedule.bookingId._id}</div></div>
                                    <div className="tsc-kv"><div className="tsc-k">Trạng thái</div><div className="tsc-v">{selectedSchedule.bookingId.status}</div></div>
                                </>
                            )}

                            {selectedSchedule.scheduleType === 'WARRANTY' && selectedSchedule.bookingWarrantyId && (
                                <>
                                    <hr />
                                    <div className="tsc-kv"><div className="tsc-k">Vấn đề</div><div className="tsc-v">{selectedSchedule.bookingWarrantyId.reportedIssue}</div></div>
                                </>
                            )}
                        </div>

                        <div className="tsc-modal__foot">
                            <button className="tsc-btn tsc-btn--primary" onClick={() => setIsModalOpen(false)}>OK</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TechnicianScheduleComponent;
