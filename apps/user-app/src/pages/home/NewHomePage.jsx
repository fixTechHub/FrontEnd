import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import {
  RiSettings3Line as Wrench,
  RiFireLine as Zap,
  RiTvLine as Tv,
  RiPhoneLine as Phone,
  RiTimeLine as Clock,
  RiShieldCheckLine as Shield,
  RiStarFill as Star,
  RiCheckLine as CheckCircle,
  RiCalendarLine as Calendar,
  RiGroupLine as Users,
  RiArrowRightLine as ArrowRight,
  RiSparklingFill as Sparkles,
  RiTrophyLine as Award,
  RiHeartFill as Heart,
  RiMessage3Line as MessageCircle,
  RiMapPinLine as MapPin,
  RiHome2Line as Refrigerator,
  RiWindyLine as AirVent,
  RiLightbulbLine as Lightbulb,
  RiToolsLine as Tools,
  RiRocketLine as Rocket,
  RiFlashlightLine as Flash,
  RiCheckboxCircleLine as CheckboxCircle,
  RiTimerLine as Timer,
  RiDropLine as Drop,
  RiSpeakerLine as Sound,
  RiCpuLine as Cpu,
  RiPlugLine as Plug,

  RiTestTubeLine as Test,

  RiWindyLine as Wind,
  RiRefreshLine as Refresh,
  RiVerifiedBadgeLine as Verified,
  RiMedalLine as Medal,
  RiCustomerServiceLine as Support,
  RiAlarmLine as Alarm,
  RiTrophyLine as Trophy,
  RiUserFill as UserIcon
} from "react-icons/ri"

import HeroBanner from "../../components/common/HeroBanner"
import AnimatedCounter from "../../components/common/AnimatedCounter"
import FAQSection from "../../components/common/FAQSection"
import SearchComponent from "../../components/common/SearchComponent"
import ServiceCardDark from "../../components/common/ServiceCardDark"
import "../../styles/homepage-complete.css"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import Header from "../../components/common/Header"
import Footer from "../../components/common/Footer"
import AIChatbox from "../../components/message/AIChatBox"
import { getPublicFeedbacks } from "../../features/feedbacks/feedbackAPI";

function NewHomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(true)

  const { user, isAuthenticated, verificationStatus } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  // NGAY LẬP TỨC redirect technician về dashboard - không render homepage
  useEffect(() => {
    // Chỉ redirect khi user đã authenticated và là TECHNICIAN
    // Không redirect khi user === null (đã logout)
    if (isAuthenticated && user && user.role && user.role.name === 'TECHNICIAN') {
      navigate('/technician', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Nếu là technician thì không render homepage, chỉ hiện loading nhỏ
  if (isAuthenticated && user && user.role && user.role.name === 'TECHNICIAN') {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'white',
        zIndex: 9999
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang chuyển hướng...</span>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Scroll animations and cursor effects
  useEffect(() => {
    // Scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
        }
      })
    }, observerOptions)

    // Observe all scroll-animate elements
    const animateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right')
    animateElements.forEach(el => observer.observe(el))

    // Remove cursor trail effects

    // Real-time counter updates
    const updateCounters = () => {
      const counters = document.querySelectorAll('.counter-enhanced')
      counters.forEach(counter => {
        if (counter.textContent.includes('12')) {
          const currentNum = parseInt(counter.textContent)
          if (Math.random() > 0.7) { // 30% chance to update
            const newNum = Math.max(1, currentNum + Math.floor(Math.random() * 3) - 1)
            counter.textContent = newNum
          }
        }
      })
    }

    const counterInterval = setInterval(updateCounters, 15000) // Update every 15 seconds

    // Cleanup
    return () => {
      observer.disconnect()
      clearInterval(counterInterval)
    }
  }, [])

  // FALLBACK testimonials đơn giản (no badges, no địa chỉ)
  const fallbackTestimonials = [
    {
      name: "Anh Khải",
      content:
        "[FALLBACK DATA] Bếp từ không hoạt động, báo lỗi E1. Thợ đến nhanh và sửa chữa chuyên nghiệp. Rất hài lòng!",
      rating: 4,
      avatar: null,
      hasRealAvatar: false,
      service: "Sửa bếp từ",
      price: "220,000đ",
      verified: false,
    },
    {
      name: "Chị Mai",
      content:
        "[FALLBACK DATA] Quạt trần quay chậm, kêu to. Thợ thay vòng bi mới, giờ chạy êm ru. Giá cả hợp lý!",
      rating: 5,
      avatar: null,
      hasRealAvatar: false,
      service: "Sửa quạt trần",
      price: "85,000đ",
      verified: false,
    },
    {
      name: "Bác Hùng",
      content:
        "[FALLBACK DATA] Máy bơm nước yếu, không lên được tầng 2. Thợ kiểm tra và thay bơm mới. Hoạt động tốt!",
      rating: 4,
      avatar: null,
      hasRealAvatar: false,
      service: "Sửa máy bơm",
      price: "450,000đ",
      verified: false,
    },
    {
      name: "Anh Phúc",
      content:
        "[FALLBACK DATA] Tivi bị sọc màn hình, không có tiếng. Thợ sửa nhanh trong 1 tiếng. Chất lượng dịch vụ tốt!",
      rating: 5,
      avatar: null,
      hasRealAvatar: false,
      service: "Sửa tivi",
      price: "180,000đ",
      verified: false,
    },
  ]

  // Fetch REAL testimonials từ database
  const fetchTestimonials = async () => {
    try {
      setTestimonialsLoading(true);
      
      // Call real backend API để lấy feedback từ database
      const result = await getPublicFeedbacks({
        limit: 6,
        visible: true
      });
      
      if (result.success && result.items && result.items.length > 0) {
        // Transform real database data để match UI structure
        const transformedTestimonials = result.items.map((item, index) => {
          // Clean processing - no debug logs
          
          // Lấy avatar thật từ user, nếu không có thì để null để dùng icon
          let realAvatar = null;
          let hasRealAvatar = false;
          
          if (item.fromUser?.avatar && item.fromUser.avatar.trim()) {
            let originalAvatar = item.fromUser.avatar;
            
            // Fix Google avatar URLs để tương thích tốt hơn
            if (originalAvatar.includes('googleusercontent.com')) {
              // Remove CORS restrictions và đảm bảo size phù hợp
              realAvatar = originalAvatar
                .replace(/=s\d+-c$/, '=s200-c') // Change to 200px
                .replace('=s96-c', '=s200-c'); // Fix specific case
            } else {
              realAvatar = originalAvatar;
            }
            hasRealAvatar = true;
          }
          
          // Lấy tên dịch vụ thật từ backend
          const realServiceName = item.bookingId?.serviceId?.serviceName || "Dịch vụ sửa chữa";
          
          // Lấy giá thật từ booking
          let realPrice = "Liên hệ";
          if (item.bookingId?.finalPrice) {
            realPrice = `${item.bookingId.finalPrice.toLocaleString()}đ`;
          } else if (item.bookingId?.quote?.totalAmount) {
            realPrice = `${item.bookingId.quote.totalAmount.toLocaleString()}đ`;
          }
          
          const transformed = {
            name: item.fromUser?.fullName || `Khách hàng ${index + 1}`,
            content: item.content || "Dịch vụ tốt, thợ chuyên nghiệp!",
            rating: item.rating || 5,
            avatar: realAvatar, // null nếu không có avatar thật
            hasRealAvatar: hasRealAvatar, // flag để biết có avatar thật không
            service: realServiceName, // ✅ Tên dịch vụ thật từ database
            price: realPrice, // ✅ Giá thật từ booking
            verified: item.isVisible !== false,
          };
          
          return transformed;
        });
        
        setTestimonials(transformedTestimonials);
      } else {
        // Fallback to sample data if no real data
        setTestimonials(fallbackTestimonials);
      }
    } catch (error) {
      setTestimonials(fallbackTestimonials);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  // Fetch testimonials on component mount
  useEffect(() => {
    fetchTestimonials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processSteps = [
    {
      icon: Phone,
      title: "Đặt lịch trên website",
      description: "Truy cập website và đặt lịch tự động. Hotline hỗ trợ hướng dẫn sử dụng web khi cần thiết.",
    },
    {
      icon: MapPin,
      title: "Thợ đến tận nơi",
      description: "Thợ có kinh nghiệm đến tận nhà với đầy đủ dụng cụ và trang bị.",
    },
    {
      icon: Wrench,
      title: "Kiểm tra & báo giá",
      description: "Kiểm tra kỹ lưỡng, chẩn đoán chính xác và báo giá chi tiết trước khi sửa.",
    },
    {
      icon: CheckCircle,
      title: "Sửa chữa & thanh toán",
      description: "Thợ tiến hành sửa chữa theo thỏa thuận. Thanh toán trực tiếp với thợ sau khi hoàn thành.",
    },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "white", overflow: "hidden" }}>
      {/* Premium Floating Particles */}
      <div className="nhp-floating-particles">
        <div className="nhp-particle"></div>
        <div className="nhp-particle"></div>
        <div className="nhp-particle"></div>
        <div className="nhp-particle"></div>
        <div className="nhp-particle"></div>
        <div className="nhp-particle"></div>
        <div className="nhp-particle"></div>
        <div className="nhp-particle"></div>
        <div className="nhp-particle"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="nhp-bg-elements">
        <div className="nhp-bg-element"></div>
        <div className="nhp-bg-element"></div>
        <div className="nhp-bg-element"></div>
        <div className="nhp-bg-element"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Enhanced Stats Section */}
      <section className="stats-section">
        <div className="container">
          {/* Enhanced Trust Badges */}
          <div className="trust-badges-enhanced">
            <div className="trust-badge-enhanced">
              <Shield size={18} />
              <span>Thợ xác thực chứng chỉ</span>
            </div>
            <div className="trust-badge-enhanced">
              <Heart size={18} />
              <span>Platform đáng tin cậy</span>
            </div>
          </div>

          <div className="stats-grid-enhanced">
            {[
              { icon: MapPin, number: 6, suffix: " quận", label: "TP Đà Nẵng phủ sóng", color: "#3b82f6", rgb: "59, 130, 246" },
              { icon: Wrench, number: 20, suffix: "+", label: "Loại thiết bị được sửa", color: "#ef4444", rgb: "239, 68, 68" },
              { icon: Star, number: 4.8, suffix: "/5", label: "Sao đánh giá trung bình", color: "#10b981", rgb: "16, 185, 129" },
              { icon: Clock, number: 24, suffix: "/7", label: "Hỗ trợ trực tiếp", color: "#8b5cf6", rgb: "139, 92, 246" },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="stat-card-enhanced"
                style={{ 
                  '--card-color': stat.color,
                  '--card-color-light': `${stat.color}CC`,
                  '--card-color-rgb': stat.rgb,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className="stat-icon-enhanced">
                  <stat.icon size={36} color="white" />
                </div>
                <div className="stat-number-enhanced">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <p className="stat-label-enhanced">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section id="dich-vu" className="nhp-services-section-enhanced">
        <div className="nhp-services-floating-bg"></div>
 
        <div className="nhp-container">
          <div className="nhp-section-header-enhanced">
            <div className="nhp-section-badge-enhanced">
              <Tools size={20} />
              <span>DỊCH VỤ CHUYÊN NGHIỆP</span>
              <Medal size={20} />
            </div>
            <h2 className="nhp-section-title-enhanced">Kết nối với thợ chuyên nghiệp</h2>
            <p className="nhp-section-description-enhanced">
              Tìm kiếm và kết nối với các thợ sửa chữa thiết bị gia dụng có kinh nghiệm tại Đà Nẵng
            </p>
          </div>

          <div className="nhp-services-grid" style={{ position: "relative", zIndex: 2 }}>
            {[
              {
                icon: Refrigerator,
                title: "Tủ lạnh",
                description: "Sửa chữa tủ lạnh không lạnh, rò rỉ, tiếng ồn. Thay thế linh kiện chính hãng, vệ sinh hệ thống làm lạnh.",
                responseTime: "Phản hồi trong 10 phút",
                serviceFeature: "Dịch vụ phổ biến",
                gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                popular: false,
                features: [
                  { icon: CheckboxCircle, text: "Kiểm tra miễn phí" },
                  { icon: Tools, text: "Thay gas R32/R410A" },
                  { icon: Timer, text: "Sửa trong 2-4h" },
                  { icon: Shield, text: "Bảo hành 6 tháng" }
                ]
              },
              {
                icon: Wrench,
                title: "Máy giặt",
                description: "Sửa máy giặt không vắt, không xả nước, rung lắc. Vệ sinh bảo dưỡng định kỳ, thay thế bo mạch.",
                responseTime: "Phản hồi trong 15 phút",
                serviceFeature: "Chuyên môn cao",
                gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                popular: true,
                features: [
                  { icon: Medal, text: "Chẩn đoán chính xác" },
                  { icon: Drop, text: "Vệ sinh sạch sẽ" },
                  { icon: Flash, text: "Sửa nhanh trong ngày" },
                  { icon: Medal, text: "Tỷ lệ thành công 98%" }
                ]
              },
              {
                icon: AirVent,
                title: "Điều hòa",
                description: "Sửa điều hòa không lạnh, rò gas, vệ sinh máy lạnh. Nạp gas R410A, R32, thay block lạnh.",
                responseTime: "Phản hồi trong 12 phút",
                serviceFeature: "Nhiều lựa chọn",
                gradient: "linear-gradient(135deg, #10b981, #059669)",
                popular: false,
                features: [
                  { icon: Test, text: "Test làm lạnh ngay" },
                  { icon: Drop, text: "Vệ sinh deep clean" },
                  { icon: CheckboxCircle, text: "Kiểm tra đầy đủ" },
                  { icon: Medal, text: "Tiết kiệm điện 30%" }
                ]
              },
              {
                icon: Tv,
                title: "TV & Điện tử",
                description: "Sửa TV không lên hình, loa, đầu DVD, amply. Thay màn hình LED, OLED, bo mạch chủ.",
                responseTime: "Phản hồi trong 20 phút",
                serviceFeature: "Kỹ thuật chuyên sâu",
                gradient: "linear-gradient(135deg, #dc2626, #ea580c)",
                popular: false,
                features: [
                  { icon: Tv, text: "Hỗ trợ mọi hãng" },
                  { icon: Sound, text: "Test âm thanh" },
                  { icon: Lightbulb, text: "LED/OLED chuyên sâu" },
                  { icon: Cpu, text: "IC, bo mạch chính hãng" }
                ]
              },
              {
                icon: Zap,
                title: "Điện gia dụng",
                description: "Sửa bếp từ, lò vi sóng, nồi cơm điện, quạt. Thay thế linh kiện an toàn, kiểm tra điện áp.",
                responseTime: "Phản hồi trong 8 phút",
                serviceFeature: "An toàn tuyệt đối",
                gradient: "linear-gradient(135deg, #eab308, #ea580c)",
                popular: true,
                features: [
                  { icon: Shield, text: "An toàn điện tuyệt đối" },
                  { icon: Test, text: "Test thực tế ngay" },
                  { icon: Plug, text: "Kiểm tra nguồn điện" },
                  { icon: Rocket, text: "Hiệu suất như mới" }
                ]
              },
              {
                icon: Wrench,
                title: "Thiết bị khác",
                description: "Máy nước nóng, máy lọc nước, máy hút bụi. Tư vấn và lắp đặt mới, bảo trì định kỳ.",
                responseTime: "Phản hồi trong 25 phút",
                serviceFeature: "Linh hoạt đa dạng",
                gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                popular: false,
                features: [
                  { icon: Drop, text: "Nước nóng ổn định" },
                  { icon: Drop, text: "Lọc nước sạch 99%" },
                  { icon: Wind, text: "Hút bụi mạnh mẽ" },
                  { icon: Refresh, text: "Bảo trì định kỳ" }
                ]
              },
            ].map((service, idx) => {
              const match = service.gradient.match(/#([0-9a-fA-F]{6})/);
              const primary = match ? match[0] : "#ff8a3d";
              return (
                <ServiceCardDark
                  key={idx}
                  icon={service.icon}
                  title={service.title}
                  responseTime={service.responseTime}
                  serviceFeature={service.serviceFeature}
                  color={primary}
                  bg={`${primary}30`}
                  description={service.description}
                  features={service.features}
                />
              );
            })}
          </div>
        </div>
          <div style={{textAlign:"center",marginTop:"2rem", position: "relative", zIndex: 2}}>
            <Link 
              to="/services" 
              className="nhp-btn-orange" 
              onClick={() => {
                // Scroll to top khi chuyển trang
                window.scrollTo(0, 0);
              }}
              style={{
                background: "linear-gradient(135deg, #fe9307, #ffb347)",
                border: "2px solid rgba(254, 147, 7, 0.3)",
                color: "white",
                backdropFilter: "blur(20px)",
                transition: "all 0.3s ease",
                display: "inline-block",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(254, 147, 7, 0.3)"
              }}
            >
              Xem tất cả dịch vụ
            </Link>
          </div>
      </section>

      {/* Enhanced Process Section */}
      <section className="nhp-process-section" id="quy-trinh">
        <div className="nhp-container">
          <div className="nhp-section-header-enhanced">
            <div className="nhp-section-badge-enhanced">
              <Rocket size={20} />
              <span>QUY TRÌNH LÀM VIỆC</span>
              <Star size={20} />
            </div>
            <h2 className="nhp-section-title-enhanced">4 bước đơn giản</h2>
            <p className="nhp-section-description-enhanced">
              Quy trình làm việc chuyên nghiệp, minh bạch từ khi nhận cuộc gọi đến khi hoàn thành dịch vụ
            </p>
          </div>

          <div className="nhp-process-grid-enhanced">
            {processSteps.map((step, index) => (
              <div key={index} className="nhp-process-step-enhanced">
                <div className="nhp-process-icon-enhanced">
                  <step.icon size={32} color="#ff6b6b" />
                </div>
                <h3 className="nhp-process-title-enhanced">{step.title}</h3>
                <p className="nhp-process-description-enhanced">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="nhp-testimonials-section-enhanced" id="danh-gia">
        <div className="nhp-testimonials-floating-particles">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="nhp-testimonial-particle"></div>
          ))}
        </div>
        
        <div className="nhp-container">
          <div className="nhp-section-header-enhanced">
            <div className="nhp-section-badge-enhanced">
              <Trophy size={20} />
              <span>KHÁCH HÀNG THỰC TẾ</span>
              <Heart size={20} />
            </div>
            <h2 className="nhp-section-title-enhanced" style={{ color: "white" }}>
              Khách hàng đầu tiên nói gì
            </h2>
            <p className="nhp-section-description-enhanced" style={{ color: "#cbd5e0" }}>
              Chất lượng dịch vụ được khẳng định qua từng phản hồi chân thực
            </p>

          </div>

          <div className="nhp-testi-swiper-wrapper">
            {testimonialsLoading ? (
              <div className="testimonials-loading-container" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                color: 'white'
              }}>
                <div className="spinner-border text-warning" role="status" style={{ marginBottom: '1rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Đang tải đánh giá từ database...</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Lấy feedback thực từ khách hàng đã sử dụng dịch vụ</p>
              </div>
            ) : (
            <Swiper
              modules={[Autoplay, Pagination]}
                loop={testimonials.length > 1}
              grabCursor={true}
              centeredSlides={false}
              speed={600}
              spaceBetween={24}
              autoplay={{ delay: 4500, disableOnInteraction: false }}
              slidesPerView={1.2}
              breakpoints={{
                640: { slidesPerView: 1.6 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              pagination={{ clickable: true }}
              className="nhp-testi-swiper"
              autoHeight={true}
            >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div className="nhp-testi-card-enhanced">
                  <div className="nhp-testi-header-enhanced">
                    <div className="nhp-testi-badges">
                      <div className="nhp-service-badge-enhanced">{testimonial.service}</div>
                      <div className="nhp-price-badge-enhanced">{testimonial.price}</div>
                    </div>
                  </div>
                  
                  <p className="nhp-testi-content-enhanced">
                    "{testimonial.content}"
                  </p>
                
                  <div className="nhp-testi-footer-enhanced">
                    <div className="nhp-testi-author-enhanced">
                      {testimonial.hasRealAvatar && testimonial.avatar ? (
                        // Hiển thị avatar thật của user
                      <img className="nhp-testi-avatar-enhanced" 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                          onError={(e) => {
                            // Nếu avatar thật fail, ẩn img và hiện icon
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      {/* Icon placeholder khi không có avatar thật */}
                      <div 
                        className="nhp-testi-avatar-placeholder"
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          backgroundColor: '#fe9307',
                          display: testimonial.hasRealAvatar && testimonial.avatar ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '24px'
                        }}
                      >
                        <UserIcon />
                      </div>
                      <div className="nhp-testi-info">
                        <div className="nhp-testi-name-row">
                          <h4 className="nhp-testi-name">{testimonial.name}</h4>
                          {testimonial.verified && (
                            <div className="nhp-verified-badge-inline">
                              <Verified size={14} />
                              <span>Xác thực</span>
                            </div>
                          )}
                        </div>
                        <div className="nhp-testi-stars">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              color="#fbbf24" 
                              fill="#fbbf24"
                            />
                          ))}
                          <span className="nhp-testi-rating-text">
                            {testimonial.rating}.0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
            </Swiper>
            )}
          </div>
          {/* <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button className="nhp-btn-orange">Đọc thêm đánh giá</button>
          </div> */}

          {/* Real-time Social Proof */}
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <div className="nhp-social-proof" style={{ fontSize: "1rem", padding: "1rem 2rem" }}>
              <Alarm size={20} style={{ animation: "bounce 2s ease-in-out infinite" }} />
              <span>Vừa có <strong className="nhp-counter-enhanced">2</strong> khách hàng đặt lịch hôm nay!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <div className="nhp-faq-section-enhanced">
        <FAQSection />
      </div>

      {/* Enhanced Footer */}
      <div className="nhp-footer-enhanced">
        <Footer />
      </div>

      {/* Premium Floating Chat Button */}
      {isAuthenticated && user.role.name === 'CUSTOMER' && <>

        <div className="nhp-ai-chatbox-container">
          <AIChatbox size={24} />
        </div>
      </>}


    </div>
  )
}

export default NewHomePage