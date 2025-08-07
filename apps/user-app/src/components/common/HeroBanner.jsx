import { 
  RiSparklingFill as Sparkles, 
  RiCalendarLine as Calendar, 
  RiArrowRightLine as ArrowRight, 
  RiPhoneLine as Phone, 
  RiSettings3Line as Wrench, 
  RiStarFill as Star, 
  RiShieldCheckLine as Shield, 
  RiHeartFill as Heart 
} from "react-icons/ri"
import SearchComponent from "./SearchComponent"

export default function HeroBanner() {
  return (
    <section className="hero-banner">
      <div className="container hero-layout">
        {/* LEFT */}
        <div className="hero-left">
          <div className="hero-badge">
            <Sparkles size={24} color="#fbbf24" className="pulse" />
            <span>Dịch vụ #1 tại TP.Đà Nẵng</span>
          </div>

          <h1 className="hero-title">
            Đặt lịch thợ sửa chữa <span className="hero-subtitle">thiết bị gia dụng</span>
          </h1>

          <p className="hero-desc">
            🚀 150+ thợ đáng tin cậy &nbsp; ⚡ Bảo hành lên đến 6 tháng &nbsp; 🏆 2500+ khách hài lòng
          </p>

          <SearchComponent />

          <div className="hero-cta">
            <button className="btn btn-lg">
              <Calendar size={20} style={{ marginRight: 8 }} />Đặt lịch ngay
              <ArrowRight size={20} style={{ marginLeft: 8 }} />
            </button>
            <button className="btn btn-lg btn-outline">
              <Phone size={20} style={{ marginRight: 8 }} />0913&nbsp;978&nbsp;802
            </button>
          </div>
        </div>

        {/* RIGHT - Image with overlays */}
        <div className="hero-right">
          <div className="image-wrapper">
            <img src="/img/worker.png" alt="Thợ sửa chữa" />

            {/* floating icons */}
            <div className="float-icon top-left"><Wrench size={20} /></div>
            <div className="float-icon top-right"><Star size={20} /></div>
            <div className="float-icon bottom-right"><Shield size={20} /></div>

            {/* rating card */}
            <div className="rating-card">
              <div className="rating-stars">
                <div className="stars-row">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} color="#fbbf24" fill="#fbbf24" />
                  ))}
                </div>
                <span className="rating-score">4.9/5</span>
              </div>
              <p className="rating-text">Từ 2 500+ khách hàng</p>
              <p className="rating-text"><Heart size={14} color="#f87171" />&nbsp;99% hài lòng</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}