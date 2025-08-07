import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
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
import "../../styles/services-dark.css"
import "../../styles/testimonials-swiper.css"
import "../../styles/testimonials-modern.css"
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
      location: "84 Trần Văn HaiHai",
      content:
        "Dịch vụ tuyệt vời! Thợ đến đúng giờ, sửa tủ lạnh Samsung 650L trong vòng 2 tiếng. Giá cả minh bạch, không phát sinh chi phí. Đã giới thiệu cho 5 đối tác khác.",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=1",
      service: "Sửa tủ lạnh",
      price: "320,000đ",
      verified: true,
    },
    {
      name: "Lan Anh",
      location: "297 Võ Liên SơnSơn",
      content:
        "Máy giặt công nghiệp 15kg bị hỏng nặng, tưởng phải thay mới hết 50 triệu. Nhưng team sửa được và bảo hành 1 năm. Tiết kiệm được rất nhiều chi phí!",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=5",
      service: "Máy giặt công nghiệp",
      price: "2,500,000đ",
      verified: true,
    },
    {
      name: "Tuấn Vũ", 
      location: "168 Núi Thành",
      content:
        "5 cái điều hòa trong quán không lạnh hết, khách phàn nàn liên tục. Gọi là có team đến ngay, sửa xong trong buổi sáng. Quán hoạt động bình thường buổi trưa. Cực kỳ hài lòng!",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=8",
      service: "Điều hòa (5 máy)",
      price: "1,800,000đ", 
      verified: true,
    },
    {
      name: "Hoa Phương",
      location: "67 Hàm Nghi",
      content:
        "Lò vi sóng Panasonic dùng 3 năm bỗng không nóng được. Thợ kiểm tra và phát hiện magnetron bị hỏng. Thay linh kiện chính hãng, bảo hành 6 tháng. Như mới luôn!",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=9",
      service: "Lò vi sóng",
      price: "450,000đ",
      verified: true,
    },
  ]

  const processSteps = [
    {
      icon: Phone,
      title: "Gọi điện đặt lịch",
      description: "Liên hệ hotline để được hướng dẫn hoặc đặt lịch online. Tư vấn miễn phí về tình trạng thiết bị.",
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
      title: "Sửa chữa & bảo hành",
      description: "Tiến hành sửa chữa và bảo hành lên đến 6 tháng. Thanh toán sau khi hoàn thành.",
    },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "white", overflow: "hidden" }}>
      {/* Premium Floating Particles */}
      <div className="floating-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="bg-elements">
        <div className="bg-element"></div>
        <div className="bg-element"></div>
        <div className="bg-element"></div>
        <div className="bg-element"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          {/* Trust Badges */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="trust-badge">
              <Shield size={20} />
              <span>Được chứng nhận bởi Cục Tiêu chuẩn Đo lường Chất lượng</span>
            </div>
            <div className="social-proof" style={{ marginLeft: "1rem" }}>
              <Heart size={16} style={{ animation: "heartbeat 1.5s ease-in-out infinite" }} />
              <span>2,500+ khách hàng tin tưởng</span>
            </div>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
            {[
              { icon: Users, number: 2500, suffix: "+", label: "Khách hàng hài lòng", color: "#3b82f6", delay: 0 },
              { icon: Wrench, number: 150, suffix: "+", label: "Thợ chuyên nghiệp", color: "#fe9307", delay: 200 },
              { icon: Award, number: 99, suffix: "%", label: "Tỷ lệ thành công", color: "#10b981", delay: 400 },
              { icon: Clock, number: 24, suffix: "/7", label: "Hỗ trợ liên tục", color: "#8b5cf6", delay: 600 },
            ].map((stat, index) => (
              <div key={index} className="card-premium stat-card scroll-animate" style={{ animationDelay: `${stat.delay}ms` }}>
                <div
                  className="stat-icon"
                  style={{
                    '--ring-color': stat.color,
                    backgroundColor: `${stat.color}15`,
                    border: `2px solid ${stat.color}30`,
                  }}
                >
                  <stat.icon size={32} color={stat.color} />
                </div>
                <div className="stat-number" style={{ color: stat.color }}>
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <p style={{ color: stat.color, fontWeight: 600, fontSize: "1rem" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="dich-vu" className="services-section services-dark">
      <div className="floating-particles">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
 
        <div className="container">
          <div className="section-header scroll-animate">
            <div className="section-badge pulse-glow">
              <Sparkles size={24} style={{ animation: "pulse 2s ease-in-out infinite" }} />
              <span className="typewriter">DỊCH VỤ CHUYÊN NGHIỆP</span>
              <Sparkles size={24} style={{ animation: "pulse 2s ease-in-out infinite" }} />
            </div>
            <h2 className="section-title magic-text neon-glow">Dịch vụ sửa chữa toàn diện</h2>
            <p className="section-description text-reveal">
              <Flash size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
              Chúng tôi cung cấp dịch vụ sửa chữa cho tất cả các loại thiết bị gia dụng với kỹ thuật tiên tiến
              <br />
              <Tools size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
              Đội ngũ thợ có kinh nghiệm và được chứng nhận kỹ thuật
              <br />
              <Medal size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
              Cam kết sửa tận nơi, uy tín, bảo hành lên đến 6 tháng
            </p>
          </div>

          <div className="services-grid">
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
          <div style={{textAlign:"center",marginTop:"2rem"}}>
            <button className="btn-orange">Xem thêm dịch vụ</button>
          </div>
      </section>

      {/* Process Section */}
      <section className="process-section" id="quy-trinh">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Sparkles size={24} style={{ animation: "pulse 2s ease-in-out infinite" }} />
              <span>QUY TRÌNH LÀM VIỆC</span>
              <Sparkles size={24} style={{ animation: "pulse 2s ease-in-out infinite" }} />
            </div>
            <h2 className="section-title">4 bước đơn giản</h2>
            <p className="section-description">
              Quy trình làm việc chuyên nghiệp, minh bạch từ khi nhận cuộc gọi đến khi hoàn thành dịch vụ
            </p>
          </div>

          <div className="process-grid">
            {processSteps.map((step, index) => (
              <div key={index} className="process-step">
                <div className="process-icon" data-step={index + 1}>
                  <step.icon size={24} color="white" />
                </div>
                <h3 className="process-title">{step.title}</h3>
                <p className="process-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" id="danh-gia">
        <div className="container">
          <div className="section-header scroll-animate">
            <div className="section-badge pulse-glow">
              <Sparkles size={24} style={{ animation: "pulse 2s ease-in-out infinite" }} />
              <span className="magic-text">KHÁCH HÀNG THỰC TẾ</span>
              <Sparkles size={24} style={{ animation: "pulse 2s ease-in-out infinite" }} />
            </div>
            <h2 className="section-title" style={{ color: "#fe9307", textShadow: "0 2px 4px rgba(0,0,0,.25)", background: "none", WebkitTextFillColor: "#fe9307", WebkitBackgroundClip: "initial" }}>
              2,500+ khách hàng đã hài lòng
            </h2>
            <p className="section-description" style={{ color: "#d1d5db" }}>
              <Trophy size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
              Từ nhà riêng đến doanh nghiệp, miễn là thiết bị gia dụng, chúng tôi đều có thể sửa được
              <br />
              <Star size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
              Đánh giá trung bình 4.7/5 sao trên tổng số đơn đánh giá
            </p>
          </div>

          <div className="testi-swiper-wrapper">
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
              className="testi-swiper"
              autoHeight={true}
            >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div className="testi-modern-card">
                <div className="testimonial-content">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    <div className="badge-service">{testimonial.service}</div>
                    <div className="badge-price">
                      {testimonial.price}
                    </div>
                    {testimonial.verified && (
                      <div style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Verified size={16} />
                        <span style={{ fontSize: "0.75rem" }}>Xác thực</span>
                      </div>
                    )}
                  </div>
                  <p className="testi-modern-content">
                    "{testimonial.content}"
                  </p>
                </div>
                
                <div className="testimonial-author">
                  <img className="testi-modern-avatar" 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                   
                  />
                  <div className="testimonial-info">
                    <h4 className="testi-modern-name">{testimonial.name}</h4>
                    <p className="testi-modern-location">{testimonial.location}</p>
                    <div className="testi-modern-stars">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          color="#fbbf24" 
                          fill="#fbbf24"
                          style={{ animation: `pulse ${0.5 + i * 0.1}s ease-in-out infinite` }}
                        />
                      ))}
                      <span style={{ marginLeft: "0.5rem", color: "#fbbf24", fontSize: "0.875rem", fontWeight: "600" }}>
                        {testimonial.rating}.0
                      </span>
                    </div>
                  </div>
                </div></div></SwiperSlide>
            ))}
            </Swiper>
          </div>
          {/* <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button className="btn-orange">Đọc thêm đánh giá</button>
          </div> */}
          
          {/* Real-time Social Proof */}
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <div className="social-proof" style={{ fontSize: "1rem", padding: "1rem 2rem" }}>
              <Alarm size={20} style={{ animation: "bounce 2s ease-in-out infinite" }} />
              <span>Vừa có <strong className="counter-enhanced">12</strong> khách hàng đặt lịch trong 30 phút qua!</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Premium Floating Chat Button */}
      <div style={{ position: "fixed", bottom: "3rem", right: "3.5rem", zIndex: 100 }}>
        <div style={{ position: "relative", width: "4rem", height: "4rem" }}>
          <button className="btn-morph floating-chat" style={{ 
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

      {/* Scroll to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="btn-liquid"
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
          zIndex: 100,
          width: "3rem",
          height: "3rem",
          borderRadius: "50%",
          display: isVisible ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <ArrowRight size={20} style={{ transform: "rotate(-90deg)" }} />
      </button>
    </div>
  )
}

export default NewHomePage