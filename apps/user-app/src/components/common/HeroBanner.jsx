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
    <section className="nhp-hero-banner-enhanced">

      <div className="nhp-container">
        {/* Enhanced Hero Content */}
        <div className="nhp-hero-content-wrapper">
          <div className="nhp-hero-left">
            {/* Enhanced Badge */}
            <div className="nhp-hero-badge-enhanced">
              <div className="nhp-badge-glow"></div>
              <Sparkles size={20} className="nhp-badge-icon" />
              <span>Dịch vụ hàng đầu tại TP.Đà Nẵng</span>
              <Verified size={18} className="nhp-verified-icon" />
            </div>

            {/* Enhanced Title */}
            <h1 className="nhp-hero-title-enhanced">
              <span className="nhp-title-single-line">
                Đặt lịch thợ sửa chữa <span className="nhp-gradient-text">thiết bị gia dụng</span>
                <Fire size={39} className="nhp-title-fire" />
              </span>
              <div className="nhp-title-underline"></div>
            </h1>

            {/* New Subtitle */}
            <p className="nhp-hero-subtitle-enhanced">
              Nền tảng kết nối thợ sửa chữa chuyên nghiệp tại TP. Đà Nẵng.<br/>
              <span className="nhp-subtitle-highlight">Thợ đến tận nhà • Bảo hành đầy đủ • Thanh toán sau khi hoàn thành</span>
            </p>

            {/* Enhanced Description with Stats */}
            <div className="nhp-hero-features">
              <div className="nhp-feature-item">
                <div className="nhp-feature-icon">
                  <Magic size={20} />
                </div>
                <span>Báo giá minh bạch</span>
              </div>
              <div className="nhp-feature-item">
                <div className="nhp-feature-icon">
                  <Shield size={20} />
                </div>
                <span>Bảo hành có cam kết</span>
              </div>
              <div className="nhp-feature-item">
                <div className="nhp-feature-icon">
                  <Lightning size={20} />
                </div>
                <span>Kết nối với thợ phù hợp</span>
              </div>
              <div className="nhp-feature-item">
                <div className="nhp-feature-icon">
                  <Support size={20} />
                </div>
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="nhp-hero-cta-enhanced">
              <button 
                className="nhp-btn-primary-enhanced"
                onClick={() => {
                  const searchSection = document.querySelector('.nhp-search-container-enhanced');
                  if (searchSection) {
                    searchSection.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }
                }}
              >
                <div className="nhp-btn-content">
                  <Calendar size={22} />
                  <span>Tìm thợ ngay</span>
                  <ArrowRight size={18} />
                </div>
                <div className="nhp-btn-glow"></div>
              </button>
              <button className="nhp-btn-secondary-enhanced">
                <Phone size={20} />
                <span>0913 978 802</span>
                <div className="nhp-btn-ripple"></div>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="nhp-hero-trust-indicators">
              <div className="nhp-trust-badge">
                <Flash size={16} />
                <span>Phản hồi trong 5 phút</span>
              </div>
              <div className="nhp-trust-badge">
                <Support size={16} />
                <span>Tư vấn miễn phí</span>
              </div>
            </div>
          </div>

          {/* RIGHT - Enhanced Image Section */}
          <div className="nhp-hero-right-enhanced">
            <div className="nhp-image-wrapper-enhanced">
              {/* Main Image */}
              <div className="nhp-hero-image-container">
                <img src="/img/worker.png" alt="Thợ sửa chữa chuyên nghiệp" className="nhp-hero-main-image" />
              </div>

              {/* Enhanced Floating Elements */}
              <div className="nhp-hero-float-elements">
                <div className="nhp-float-element nhp-float-element-1">
                  <div className="nhp-element-icon">
                    <Wrench size={18} />
                  </div>
                  <span>Dụng cụ chuyên nghiệp</span>
                </div>

                <div className="nhp-float-element nhp-float-element-2">
                  <div className="nhp-element-icon">
                    <Star size={18} />
                  </div>
                  <span>Thợ 5 sao</span>
                </div>

                <div className="nhp-float-element nhp-float-element-3">
                  <div className="nhp-element-icon">
                    <Shield size={18} />
                  </div>
                  <span>Đảm bảo chất lượng</span>
                </div>
              </div>

                                   {/* Beautiful Rating Card */}
                     <div className="nhp-rating-card-simple">
                       <div className="nhp-rating-header">
                         <div className="nhp-rating-badge-simple">
                           <Verified size={14} />
                           <span>Đánh giá thực tế</span>
                         </div>
                       </div>

                       <div className="nhp-rating-content">
                         <div className="nhp-rating-score-main">
                           <span className="nhp-score-big">4.9</span>
                           <div className="nhp-stars-row">
                             <div className="nhp-stars-container">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={14} className="nhp-star-icon" />
                               ))}
                             </div>
                             <p className="nhp-rating-text">Từ người dùng thực tế</p>
                           </div>
                         </div>

                         <div className="nhp-trust-stats">
                           <div className="nhp-trust-item">
                             <Heart size={14} />
                             <span>Platform tin cậy</span>
                           </div>
                           <div className="nhp-trust-item">
                             <Shield size={14} />
                             <span>Thợ xác thực</span>
                           </div>
                         </div>
                       </div>
                     </div>
            </div>
          </div>
        </div>

        {/* Featured Search Component */}
        <div className="nhp-hero-search-section">
          <SearchComponent />
        </div>
      </div>
    </section>
  )
}