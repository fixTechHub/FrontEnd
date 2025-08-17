import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
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
  RiTrophyLine as Trophy
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

function NewHomePage() {
  const [isVisible, setIsVisible] = useState(false)
  

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

  const testimonials = [
    {
      name: "Minh Đức",
      location: "Sơn Trà, Đà Nẵng",
      content:
        "Tủ lạnh nhà em không lạnh, anh thợ đến sửa nhanh trong 1 tiếng. Giá cả hợp lý, làm việc sạch sẽ. Rất hài lòng!",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=1",
      service: "Sửa tủ lạnh",
      price: "180,000đ",
      verified: true,
    },
    {
      name: "Lan Anh",
      location: "Hải Châu, Đà Nẵng",
      content:
        "Máy giặt kêu to, không vắt được. Thợ kiểm tra và sửa trong buổi sáng. Giá phù hợp với chất lượng dịch vụ!",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=5",
      service: "Sửa máy giặt",
      price: "120,000đ",
      verified: true,
    },
    {
      name: "Tuấn Vũ", 
      location: "Thanh Khê, Đà Nẵng",
      content:
        "Điều hòa phòng khách không mát, thổi gió nóng. Anh thợ đến kiểm tra và sửa trong 2 tiếng. Giờ mát lạnh như mới!",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=8",
      service: "Sửa điều hòa",
      price: "200,000đ", 
      verified: true,
    },
    {
      name: "Hoa Phương",
      location: "Liên Chiểu, Đà Nẵng",
      content:
        "Lò vi sóng không nóng được thức ăn. Thợ kiểm tra và thay linh kiện. Bảo hành 3 tháng, rất yên tâm!",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=9",
      service: "Sửa lò vi sóng",
      price: "150,000đ",
      verified: true,
    },
  ]

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
      <section className="nhp-stats-section">
        <div className="nhp-container">
          {/* Enhanced Trust Badges */}
          <div className="nhp-trust-badges-enhanced">
            <div className="nhp-trust-badge-verified">
              <Shield size={18} />
              <span>Thợ xác thực chứng chỉ</span>
            </div>
            <div className="nhp-trust-badge-customers">
              <Heart size={18} />
              <span>Platform đáng tin cậy</span>
            </div>
          </div>

          <div className="nhp-stats-grid-enhanced">
            {[
              { icon: MapPin, number: 6, suffix: " quận", label: "TP Đà Nẵng phủ sóng", color: "#3b82f6", rgb: "59, 130, 246" },
              { icon: Wrench, number: 20, suffix: "+", label: "Loại thiết bị được sửa", color: "#ef4444", rgb: "239, 68, 68" },
              { icon: Star, number: 4.8, suffix: "/5", label: "Sao đánh giá trung bình", color: "#10b981", rgb: "16, 185, 129" },
              { icon: Clock, number: 24, suffix: "/7", label: "Hỗ trợ trực tiếp", color: "#8b5cf6", rgb: "139, 92, 246" },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="nhp-stat-card-enhanced"
                style={{ 
                  '--nhp-card-color': stat.color,
                  '--nhp-card-color-light': `${stat.color}CC`,
                  '--nhp-card-color-rgb': stat.rgb,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className="nhp-stat-icon-enhanced">
                  <stat.icon size={36} color="white" />
                </div>
                <div className="nhp-stat-number-enhanced">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <p className="nhp-stat-label-enhanced">{stat.label}</p>
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
                price: "150K - 500K",
                gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                popular: false,
                features: [
                  { icon: CheckboxCircle, text: "Kiểm tra miễn phí" },
                  { icon: Tools, text: "Thay gas R32/R410A" },
                  { icon: Timer, text: "Sửa trong 2-4h" },
                  { icon: Shield, text: "Bảo hành 6 tháng" }
                ],
                rating: 4.9,
                reviews: 324
              },
              {
                icon: Wrench,
                title: "Máy giặt",
                description: "Sửa máy giặt không vắt, không xả nước, rung lắc. Vệ sinh bảo dưỡng định kỳ, thay thế bo mạch.",
                price: "120K - 400K",
                gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                popular: true,
                features: [
                  { icon: Medal, text: "Chẩn đoán chính xác" },
                  { icon: Drop, text: "Vệ sinh sạch sẽ" },
                  { icon: Flash, text: "Sửa nhanh trong ngày" },
                  { icon: Medal, text: "Tỷ lệ thành công 98%" }
                ],
                rating: 4.8,
                reviews: 256
              },
              {
                icon: AirVent,
                title: "Điều hòa",
                description: "Sửa điều hòa không lạnh, rò gas, vệ sinh máy lạnh. Nạp gas R410A, R32, thay block lạnh.",
                price: "200K - 800K",
                gradient: "linear-gradient(135deg, #10b981, #059669)",
                popular: false,
                features: [
                  { icon: Test, text: "Test làm lạnh ngay" },
                  { icon: Drop, text: "Vệ sinh deep clean" },
                  { icon: CheckboxCircle, text: "Kiểm tra đầy đủ" },
                  { icon: Medal, text: "Tiết kiệm điện 30%" }
                ],
                rating: 4.9,
                reviews: 189
              },
              {
                icon: Tv,
                title: "TV & Điện tử",
                description: "Sửa TV không lên hình, loa, đầu DVD, amply. Thay màn hình LED, OLED, bo mạch chủ.",
                price: "100K - 600K",
                gradient: "linear-gradient(135deg, #dc2626, #ea580c)",
                popular: false,
                features: [
                  { icon: Tv, text: "Hỗ trợ mọi hãng" },
                  { icon: Sound, text: "Test âm thanh" },
                  { icon: Lightbulb, text: "LED/OLED chuyên sâu" },
                  { icon: Cpu, text: "IC, bo mạch chính hãng" }
                ],
                rating: 4.7,
                reviews: 142
              },
              {
                icon: Zap,
                title: "Điện gia dụng",
                description: "Sửa bếp từ, lò vi sóng, nồi cơm điện, quạt. Thay thế linh kiện an toàn, kiểm tra điện áp.",
                price: "80K - 300K",
                gradient: "linear-gradient(135deg, #eab308, #ea580c)",
                popular: true,
                features: [
                  { icon: Shield, text: "An toàn điện tuyệt đối" },
                  { icon: Test, text: "Test thực tế ngay" },
                  { icon: Plug, text: "Kiểm tra nguồn điện" },
                  { icon: Rocket, text: "Hiệu suất như mới" }
                ],
                rating: 4.8,
                reviews: 298
              },
              {
                icon: Wrench,
                title: "Thiết bị khác",
                description: "Máy nước nóng, máy lọc nước, máy hút bụi. Tư vấn và lắp đặt mới, bảo trì định kỳ.",
                price: "100K - 400K",
                gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                popular: false,
                features: [
                  { icon: Drop, text: "Nước nóng ổn định" },
                  { icon: Drop, text: "Lọc nước sạch 99%" },
                  { icon: Wind, text: "Hút bụi mạnh mẽ" },
                  { icon: Refresh, text: "Bảo trì định kỳ" }
                ],
                rating: 4.6,
                reviews: 87
              },
            ].map((service, idx) => {
              const match = service.gradient.match(/#([0-9a-fA-F]{6})/);
              const primary = match ? match[0] : "#ff8a3d";
              return (
                <ServiceCardDark
                  key={idx}
                  icon={service.icon}
                  title={service.title}
                  price={service.price}
                  rating={service.rating}
                  reviews={service.reviews}
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
                background: "rgba(255, 255, 255, 0.2)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                backdropFilter: "blur(20px)",
                transition: "all 0.3s ease",
                display: "inline-block",
                textDecoration: "none"
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
              50+ khách hàng đầu tiên
            </h2>
            <p className="nhp-section-description-enhanced" style={{ color: "#cbd5e0" }}>
              Từ những đơn hàng đầu tiên, chúng tôi đã tạo được lòng tin với chất lượng dịch vụ
            </p>
          </div>

          <div className="nhp-testi-swiper-wrapper">
            <Swiper
              modules={[Autoplay, Pagination]}
              loop={true}
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
                      <img className="nhp-testi-avatar-enhanced" 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                      />
                      <div className="nhp-testi-info">
                        <h4 className="nhp-testi-name">{testimonial.name}</h4>
                        <p className="nhp-testi-location">{testimonial.location}</p>
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
                    {testimonial.verified && (
                      <div className="nhp-verified-badge">
                        <Verified size={16} />
                        <span>Xác thực</span>
                      </div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
            </Swiper>
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
      <div style={{ position: "fixed", bottom: "3rem", right: "3.5rem", zIndex: 100 }}>
        <div style={{ position: "relative", width: "4rem", height: "4rem" }}>
          <button className="nhp-btn-morph nhp-floating-chat" style={{ 
            width: "4rem", 
            height: "4rem", 
            borderRadius: "50%",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "bounce 3s ease-in-out infinite"
          }}>
            <MessageCircle size={24} />
          </button>
          {/* Small pulse ring only around the chat button */}


        </div>

      </div>


    </div>
  )
}

export default NewHomePage