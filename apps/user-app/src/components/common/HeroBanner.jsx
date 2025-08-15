import { 
  RiSparklingFill as Sparkles, 
  RiCalendarLine as Calendar, 
  RiArrowRightLine as ArrowRight, 
  RiPhoneLine as Phone, 
  RiSettings3Line as Wrench, 
  RiStarFill as Star, 
  RiShieldCheckLine as Shield, 
  RiHeartFill as Heart,
  RiFireLine as Fire,
  RiRocketLine as Rocket,
  RiThunderstormsLine as Lightning,
  RiFlashlightLine as Flash,
  RiMagicLine as Magic,
  RiTrophyLine as Trophy,
  RiVerifiedBadgeLine as Verified,
  RiTimerLine as Timer,
  RiCustomerServiceLine as Support
} from "react-icons/ri"
import SearchComponent from "./SearchComponent"
// Styles now included in homepage-complete.css

export default function HeroBanner() {
  return (
    <section className="hero-banner-enhanced">

      <div className="container">
        {/* Enhanced Hero Content */}
        <div className="hero-content-wrapper">
          <div className="hero-left">
            {/* Enhanced Badge */}
            <div className="hero-badge-enhanced">
              <div className="badge-glow"></div>
              <Sparkles size={20} className="badge-icon" />
              <span>Dịch vụ #1 tại TP.Đà Nẵng</span>
              <Verified size={18} className="verified-icon" />
            </div>

            {/* Enhanced Title */}
            <h1 className="hero-title-enhanced">
              <span className="title-single-line">
                Đặt lịch thợ sửa chữa <span className="gradient-text">thiết bị gia dụng</span>
                <Fire size={32} className="title-fire" />
              </span>
              <div className="title-underline"></div>
            </h1>

            {/* Enhanced Description with Stats */}
            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <Rocket size={20} />
                </div>
                <span>150+ thợ chuyên nghiệp</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Shield size={20} />
                </div>
                <span>Bảo hành 6 tháng</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Trophy size={20} />
                </div>
                <span>2500+ khách hài lòng</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Timer size={20} />
                </div>
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="hero-cta-enhanced">
              <button className="btn-primary-enhanced">
                <div className="btn-content">
                  <Calendar size={22} />
                  <span>Đặt lịch ngay</span>
                  <ArrowRight size={18} />
                </div>
                <div className="btn-glow"></div>
              </button>
              <button className="btn-secondary-enhanced">
                <Phone size={20} />
                <span>0913 978 802</span>
                <div className="btn-ripple"></div>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="hero-trust-indicators">
              <div className="trust-badge">
                <Flash size={16} />
                <span>Phản hồi trong 5 phút</span>
              </div>
              <div className="trust-badge">
                <Support size={16} />
                <span>Tư vấn miễn phí</span>
              </div>
            </div>
          </div>

          {/* RIGHT - Enhanced Image Section */}
          <div className="hero-right-enhanced">
            <div className="image-wrapper-enhanced">
              {/* Main Image */}
              <div className="hero-image-container">
                <img src="/img/worker.png" alt="Thợ sửa chữa chuyên nghiệp" className="hero-main-image" />
              </div>

              {/* Enhanced Floating Elements */}
              <div className="hero-float-elements">
                <div className="float-element float-element-1">
                  <div className="element-icon">
                    <Wrench size={18} />
                  </div>
                  <span>Dụng cụ chuyên nghiệp</span>
                </div>

                <div className="float-element float-element-2">
                  <div className="element-icon">
                    <Star size={18} />
                  </div>
                  <span>Thợ 5 sao</span>
                </div>

                <div className="float-element float-element-3">
                  <div className="element-icon">
                    <Shield size={18} />
                  </div>
                  <span>Đảm bảo chất lượng</span>
                </div>
              </div>

                                   {/* Beautiful Rating Card */}
                     <div className="rating-card-simple">
                       <div className="rating-header">
                         <div className="rating-badge-simple">
                           <Verified size={14} />
                           <span>Đánh giá thực tế</span>
                         </div>
                       </div>

                       <div className="rating-content">
                         <div className="rating-score-main">
                           <span className="score-big">4.9</span>
                           <div className="stars-row">
                             <div className="stars-container">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={14} className="star-icon" />
                               ))}
                             </div>
                             <p className="rating-text">Từ 2,500+ đánh giá</p>
                           </div>
                         </div>

                         <div className="trust-stats">
                           <div className="trust-item">
                             <Heart size={14} />
                             <span>99% hài lòng</span>
                           </div>
                           <div className="trust-item">
                             <Shield size={14} />
                             <span>100% uy tín</span>
                           </div>
                         </div>
                       </div>
                     </div>
            </div>
          </div>
        </div>

        {/* Featured Search Component */}
        <div className="hero-search-section">
          <SearchComponent />
        </div>
      </div>
    </section>
  )
}