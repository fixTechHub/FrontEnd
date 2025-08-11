import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchTechnicianJobDetails } from '../../features/technicians/technicianSlice';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';

const TechnicianJob = () => {
  const technician = useSelector((state) => state.auth);
  const { bookingId } = useParams();
  const technicianId = technician?.technician?._id;

  const dispatch = useDispatch();

  const jobDetail = useSelector((state) => state.technician.jobDetail);
  const loading   = useSelector((state) => state.technician.loading);
  const error     = useSelector((state) => state.technician.error);

  useEffect(() => {
    if (technicianId && bookingId) {
      dispatch(fetchTechnicianJobDetails({ technicianId, bookingId }));
    }
  }, [technicianId, bookingId, dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error}</p>;
  if (!jobDetail) return <p>No job detail found.</p>;

  const fmt = (d) => (d ? new Date(d).toLocaleString('vi-VN') : 'Không có');
  const statusKey   = (jobDetail.status || '').toUpperCase();
  const paymentKey  = (jobDetail.paymentStatus || '').toUpperCase();

  const statusColor =
    ['NEW', 'PENDING'].includes(statusKey) ? 'sky'
    : statusKey === 'IN_PROGRESS' ? 'amber'
    : ['DONE', 'COMPLETED'].includes(statusKey) ? 'green'
    : ['CANCELLED', 'FAILED'].includes(statusKey) ? 'red' : 'gray';

  const paymentColor =
    paymentKey === 'PAID' ? 'green'
    : paymentKey === 'REFUNDED' ? 'violet'
    : paymentKey === 'UNPAID' ? 'amber' : 'gray';

  return (
    <>
      <style>{`
        :root{
          --radius: 14px;
          --border: #e9eef3;
          --text: #0f172a;
          --muted: #607085;
        }
        .jd-container{ max-width: 1040px; margin: 0 auto; padding: 24px 24px 40px; }
        .jd-card{ background:#fff; border:1px solid var(--border); border-radius: var(--radius);
          box-shadow: 0 8px 24px rgba(16,24,40,.06); overflow: hidden; }
        .jd-card__header{ padding: 22px 24px; border-bottom:1px solid var(--border); }
        .jd-title{ margin:0 0 6px 0; font-size: 24px; font-weight: 700; color: var(--text); }
        .jd-header-row{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .jd-pill{ display:inline-block; padding:6px 12px; font-size:14px; color:#1554d1;
          background:#eef4ff; border:1px solid #cfe0ff; border-radius: 999px; }
        .jd-grid{ display:grid; grid-template-columns: 1fr; gap: 18px; padding: 20px 24px; }
        @media (min-width: 900px){ .jd-grid{ grid-template-columns: 1fr 1fr; } }
        .jd-col{ display:flex; flex-direction:column; gap:12px; }
        .jd-field{ background:#f7f9fc; border:1px solid var(--border); border-radius: 12px;
          padding: 12px 14px; }
        .jd-field__label{ font-size:12px; text-transform:uppercase; letter-spacing:.04em; color: var(--muted); }
        .jd-field__value{ margin-top:4px; color: var(--text); }
        .jd-badges-row{ display:flex; flex-wrap:wrap; gap:8px; }
        .jd-badge{ display:inline-flex; align-items:center; gap:6px; padding:6px 10px; font-size:12px;
          font-weight:600; border-radius:999px; border:1px solid transparent; }
        .jd-badge--green{ background:#eaf8f0; color:#1e7d4e; border-color:#cdebd8; }
        .jd-badge--amber{ background:#fff7e6; color:#9a6a03; border-color:#ffe2ad; }
        .jd-badge--red{ background:#ffeef0; color:#b42318; border-color:#ffd1d6; }
        .jd-badge--sky{ background:#e9f5ff; color:#0b6aa7; border-color:#cce7ff; }
        .jd-badge--violet{ background:#f1eaff; color:#6b3fa0; border-color:#e0d0ff; }
        .jd-badge--gray{ background:#f2f4f7; color:#3f4a5a; border-color:#e5e7eb; }
        .jd-divider{ height:1px; background:var(--border); }
        .jd-section{ padding: 18px 24px 24px; }
        .jd-subtitle{ margin:0 0 10px 0; font-size:18px; font-weight:700; color:var(--text); }
        .jd-muted{ color:#6b7280; }
        .jd-gallery{ display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; }
        @media (min-width: 900px){ .jd-gallery{ grid-template-columns: repeat(4, 1fr); } }
        .jd-figure{ position:relative; overflow:hidden; border-radius:12px; border:1px solid var(--border); }
        .jd-img{ width:100%; height:160px; object-fit:cover; transition: transform .3s ease; }
        .jd-figure:hover .jd-img{ transform: scale(1.05); }
        .jd-caption{ position:absolute; left:0; right:0; bottom:0; padding:6px 8px; font-size:11px;
          color:#fff; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.45) 100%);
          text-align:right; pointer-events:none; }
      `}</style>

      <div className="main-wrapper">
        <Header />
        <BreadcrumbBar />

        <div className="jd-container">
          <div className="jd-card">
            <div className="jd-card__header">
              <h2 className="jd-title">Thông tin đơn đặt</h2>
              <div className="jd-header-row">
                <span className="jd-pill">Mã đơn: {jobDetail.bookingCode || '—'}</span>
                <Badge label={`Trạng thái: ${jobDetail.status || 'Chưa rõ'}`} color={statusColor} />
                <Badge label={`Thanh toán: ${jobDetail.paymentStatus || 'Chưa rõ'}`} color={paymentColor} />
              </div>
            </div>

            <div className="jd-grid">
              <div className="jd-col">
                <Field label="Mô tả" value={jobDetail.description || 'Chưa có mô tả'} />
                <Field label="Khách hàng" value={jobDetail.customerId?.fullName || 'Ẩn danh'} />
                <Field label="Dịch vụ" value={jobDetail.serviceId?.serviceName || 'Không rõ'} />
              </div>
              <div className="jd-col">
                <Field label="Địa chỉ" value={jobDetail.location?.address || 'Không có địa chỉ'} />
                <Field label="Lịch hẹn" value={fmt(jobDetail.schedule)} />
                <div className="jd-badges-row">
                  <Badge
                    label={`Xác nhận khách: ${jobDetail.customerConfirmedDone ? 'Có' : 'Chưa'}`}
                    color={jobDetail.customerConfirmedDone ? 'green' : 'gray'}
                  />
                  <Badge
                    label={`Xác nhận kỹ thuật: ${jobDetail.technicianConfirmedDone ? 'Có' : 'Chưa'}`}
                    color={jobDetail.technicianConfirmedDone ? 'green' : 'gray'}
                  />
                </div>
              </div>
            </div>

            <div className="jd-divider" />

            <div className="jd-section">
              <h3 className="jd-subtitle">Hình ảnh</h3>
              {jobDetail.images?.length ? (
                <div className="jd-gallery">
                  {jobDetail.images.map((url, i) => (
                    <figure key={i} className="jd-figure">
                      <img src={url} alt={`Hình ${i + 1}`} className="jd-img" loading="lazy" />
                      <figcaption className="jd-caption">Hình {i + 1}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="jd-muted">Chưa có hình ảnh nào được tải lên.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TechnicianJob;

function Badge({ label, color = 'gray' }) {
  return <span className={`jd-badge jd-badge--${color}`}>{label}</span>;
}

function Field({ label, value }) {
  return (
    <div className="jd-field">
      <div className="jd-field__label">{label}</div>
      <div className="jd-field__value">{value}</div>
    </div>
  );
}
