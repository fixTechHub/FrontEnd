import React, { useEffect } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { 
  RiSettings3Line as Wrench,
  RiShieldCheckLine as Shield,
  RiStarFill as Star,
  RiHeartFill as Heart,
  RiTeamLine as Team,
  RiLightbulbLine as Lightbulb,
  RiRocketLine as Rocket,
  RiCheckLine as Check,
  RiMapPinLine as MapPin,
  RiEyeLine as Eye,
  RiFlagLine as Target
} from "react-icons/ri";

function AboutPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      <Header />
      
      {/* Hero Section */}
      <section style={{ 
        background: "linear-gradient(135deg, #fe9307 0%, #ff6b6b 100%)",
        padding: "8rem 0 6rem",
        color: "white",
        textAlign: "center"
      }}>
        <div className="nhp-container">
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "0.5rem",
              background: "rgba(255,255,255,0.2)",
              padding: "0.5rem 1.5rem",
              borderRadius: "50px",
              marginBottom: "2rem"
            }}>
              <Wrench size={20} />
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>VỀ CHÚNG TÔI</span>
            </div>
            
            <h1 style={{ 
              fontSize: "3.5rem", 
              fontWeight: "900", 
              marginBottom: "1.5rem",
              lineHeight: "1.1"
            }}>
              Nền tảng kết nối <br/>
              <span style={{ color: "#ffd700" }}>thợ sửa chữa #1</span> tại Đà Nẵng
            </h1>
            
            <p style={{ 
              fontSize: "1.25rem", 
              opacity: "0.9", 
              lineHeight: "1.6",
              marginBottom: "2rem"
            }}>
              FixTech được tạo ra với sứ mệnh kết nối khách hàng với các thợ sửa chữa 
              thiết bị gia dụng có kinh nghiệm và uy tín tại TP. Đà Nẵng.
            </p>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: "3rem",
              marginTop: "3rem"
            }}>
              <div>
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#ffd700" }}>50+</div>
                <div style={{ fontSize: "0.9rem", opacity: "0.8" }}>Kết nối thành công</div>
              </div>
              <div>
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#ffd700" }}>6</div>
                <div style={{ fontSize: "0.9rem", opacity: "0.8" }}>Quận được phủ sóng</div>
              </div>
              <div>
                <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#ffd700" }}>4.8</div>
                <div style={{ fontSize: "0.9rem", opacity: "0.8" }}>Sao đánh giá</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={{ padding: "6rem 0" }}>
        <div className="nhp-container">
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "4rem",
            alignItems: "center"
          }}>
            <div>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem",
                marginBottom: "1rem"
              }}>
                <Target size={24} color="#fe9307" />
                <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#2d3748" }}>
                  Sứ mệnh
                </h2>
              </div>
              <p style={{ 
                fontSize: "1.1rem", 
                lineHeight: "1.7", 
                color: "#4a5568",
                marginBottom: "2rem"
              }}>
                Tạo ra một nền tảng tin cậy, giúp mọi gia đình tại Đà Nẵng dễ dàng 
                tìm kiếm và kết nối với các thợ sửa chữa thiết bị gia dụng chuyên nghiệp, 
                tiết kiệm thời gian và chi phí.
              </p>
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem",
                marginBottom: "1rem"
              }}>
                <Eye size={24} color="#fe9307" />
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2d3748" }}>
                  Tầm nhìn
                </h3>
              </div>
              <p style={{ 
                fontSize: "1.1rem", 
                lineHeight: "1.7", 
                color: "#4a5568"
              }}>
                Trở thành nền tảng kết nối thợ sửa chữa hàng đầu tại Việt Nam, 
                mang lại giải pháp sửa chữa thiết bị gia dụng nhanh chóng, 
                chất lượng và đáng tin cậy cho mọi gia đình.
              </p>
            </div>
            
            <div style={{ 
              background: "linear-gradient(135deg, #ff6b6b 0%, #ef4444 100%)",
              borderRadius: "20px",
              padding: "3rem",
              color: "white",
              textAlign: "center"
            }}>
              <Team size={80} style={{ marginBottom: "1.5rem" }} />
              <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
                Đội ngũ FixTech
              </h3>
              <p style={{ fontSize: "1rem", opacity: "0.9", lineHeight: "1.6" }}>
                Chúng tôi là những người trẻ đam mê công nghệ, mong muốn 
                mang lại giải pháp sửa chữa tiện lợi cho mọi gia đình.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ 
        background: "linear-gradient(135deg, #fff5f5 0%, #fed7cc 100%)",
        padding: "6rem 0"
      }}>
        <div className="nhp-container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "bold", 
              color: "#2d3748",
              marginBottom: "1rem"
            }}>
              FixTech hoạt động như thế nào?
            </h2>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "#4a5568",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              Quy trình đơn giản 4 bước để kết nối bạn với thợ sửa chữa phù hợp
            </p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "2rem"
          }}>
            {[
              {
                step: "01",
                icon: <Rocket size={40} />,
                title: "Đặt lịch trên website",
                desc: "Mô tả tình trạng thiết bị và địa chỉ của bạn trên nền tảng"
              },
              {
                step: "02", 
                icon: <MapPin size={40} />,
                title: "Hệ thống tìm thợ",
                desc: "AI của chúng tôi tự động tìm kiếm thợ phù hợp trong khu vực"
              },
              {
                step: "03",
                icon: <Heart size={40} />,
                title: "Kết nối & báo giá",
                desc: "Thợ liên hệ, kiểm tra và báo giá trực tiếp với bạn"
              },
              {
                step: "04",
                icon: <Check size={40} />,
                title: "Sửa chữa & thanh toán",
                desc: "Thợ thực hiện sửa chữa, bạn thanh toán khi hài lòng"
              }
            ].map((item, index) => (
              <div key={index} style={{
                background: "white",
                borderRadius: "15px",
                padding: "2rem",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                position: "relative"
              }}>
                <div style={{
                  position: "absolute",
                  top: "-15px",
                  left: "20px",
                  background: "#fe9307",
                  color: "white",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9rem",
                  fontWeight: "bold"
                }}>
                  {item.step}
                </div>
                
                <div style={{ color: "#fe9307", marginBottom: "1rem" }}>
                  {item.icon}
                </div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "bold", 
                  color: "#2d3748",
                  marginBottom: "0.5rem"
                }}>
                  {item.title}
                </h3>
                <p style={{ 
                  fontSize: "0.95rem", 
                  color: "#4a5568",
                  lineHeight: "1.5"
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Journey */}
      <section style={{ padding: "6rem 0" }}>
        <div className="nhp-container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "bold", 
              color: "#2d3748",
              marginBottom: "1rem"
            }}>
              Hành trình phát triển
            </h2>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "#4a5568",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              Từ ý tưởng đến hiện thực - câu chuyện về FixTech
            </p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "2rem",
            maxWidth: "1200px",
            margin: "0 auto"
          }}
          className="journey-grid"
          >
            {[
              {
                year: "2025 Q1",
                title: "Khởi động dự án",
                desc: "Ý tưởng FixTech ra đời từ việc nhận thấy khó khăn trong việc tìm thợ sửa chữa uy tín tại Đà Nẵng."
              },
              {
                year: "2025 Q2", 
                title: "Nghiên cứu thị trường",
                desc: "Khảo sát nhu cầu khách hàng và thợ sửa chữa. Phát triển MVP đầu tiên của nền tảng."
              },
              {
                year: "2025 Q3",
                title: "Phát triển sản phẩm",
                desc: "Hoàn thiện tính năng AI matching, hệ thống đánh giá và thanh toán an toàn."
              },
              {
                year: "2025 Q4",
                title: "Ra mắt Beta",
                desc: "Phiên bản thử nghiệm với 10+ thợ đầu tiên. Nhận feedback và cải thiện sản phẩm."
              },
              {
                year: "2026 Q1",
                title: "Mở rộng dịch vụ",
                desc: "Chính thức hoạt động tại 6 quận Đà Nẵng với 50+ kết nối thành công."
              },
              {
                year: "2026 Q2",
                title: "Tương lai",
                desc: "Mở rộng ra các tỉnh thành khác, tích hợp IoT và phát triển ứng dụng mobile."
              }
            ].map((item, index) => (
              <div key={index} style={{
                background: "white",
                borderRadius: "15px",
                padding: "2rem",
                border: "1px solid #e2e8f0",
                borderLeft: "5px solid #fe9307",
                boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
              }}>
                <div style={{
                  background: "#fe9307",
                  color: "white",
                  borderRadius: "20px",
                  padding: "0.5rem 1rem",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  display: "inline-block"
                }}>
                  {item.year}
                </div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "bold", 
                  color: "#2d3748",
                  marginBottom: "0.5rem"
                }}>
                  {item.title}
                </h3>
                <p style={{ 
                  fontSize: "1rem", 
                  color: "#4a5568",
                  lineHeight: "1.6"
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section style={{ 
        background: "#f7fafc",
        padding: "6rem 0"
      }}>
        <div className="nhp-container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "bold", 
              color: "#2d3748",
              marginBottom: "1rem"
            }}>
              Đội ngũ FixTech
            </h2>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "#4a5568",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              Những con người đằng sau thành công của FixTech
            </p>
          </div>
          
          {/* Leader Card - Centered */}
          <div style={{ 
            display: "flex",
            justifyContent: "center",
            marginBottom: "3rem"
          }}>
            {[
              {
                name: "Lê Viết Duy",
                role: "Team Leader",
                desc: "Dẫn dắt đội ngũ phát triển và định hướng chiến lược sản phẩm FixTech.",
                avatar: "/img/team/leader.png",
                isLeader: true
              }
            ].map((member, index) => (
              <div key={index} style={{
                background: "linear-gradient(135deg, #fe9307 0%, #ff6b6b 100%)",
                borderRadius: "20px",
                padding: "2.5rem",
                textAlign: "center",
                border: "3px solid #fe9307",
                boxShadow: "0 15px 40px rgba(254, 147, 7, 0.3)",
                color: "white",
                position: "relative",
                maxWidth: "280px",
                width: "100%"
              }}>
                <div style={{
                  position: "absolute",
                  top: "-15px",
                  right: "-15px",
                  background: "#ffd700",
                  color: "#2d3748",
                  borderRadius: "25px",
                  padding: "0.5rem 1rem",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  boxShadow: "0 5px 15px rgba(255, 215, 0, 0.4)"
                }}>
                  LEADER
                </div>
                <div style={{
                  marginBottom: "1.5rem",
                  display: "flex",
                  justifyContent: "center"
                }}>
                  <img 
                    src={member.avatar}
                    alt={member.name}
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "4px solid rgba(255,255,255,0.3)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      display: "none",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.5rem",
                      border: "4px solid rgba(255,255,255,0.3)"
                    }}
                  >
                    👨‍💼
                  </div>
                </div>
                <h3 style={{ 
                  fontSize: "1.4rem", 
                  fontWeight: "bold", 
                  color: "white",
                  marginBottom: "0.5rem"
                }}>
                  {member.name}
                </h3>
                <div style={{
                  color: "#ffd700",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  fontSize: "1.1rem"
                }}>
                  {member.role}
                </div>
                <p style={{ 
                  fontSize: "1rem", 
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: "1.6"
                }}>
                  {member.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Team Members Grid - 4 cards */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, minmax(280px, 1fr))", 
            gap: "1.5rem",
            maxWidth: "1200px",
            margin: "0 auto"
          }}
          className="team-members-grid"
          >
            {[
              {
                name: "Nguyễn Đức Trí",
                role: "Team Member",
                desc: "Tham gia xây dựng toàn diện dự án, từ thiết kế database đến triển khai tính năng.",
                avatar: "/img/team/frontend-dev.png",
                fallbackEmoji: "👨‍💻",
                isLeader: false
              },
              {
                name: "Nguyễn Khánh Đạt",
                role: "Team Member",
                desc: "Cùng nhau phát triển nền tảng FixTech, từ giao diện người dùng đến hệ thống backend.",
                avatar: "/img/team/backend-dev.png",
                fallbackEmoji: "👨‍💻",
                isLeader: false
              },
              {
                name: "Lê Nguyễn Quốc Đạt",
                role: "Team Member",
                desc: "Đóng góp vào mọi khía cạnh của dự án, từ thiết kế UX/UI đến lập trình.",
                avatar: "/img/team/designer.png",
                fallbackEmoji: "👨‍💻",
                isLeader: false
              },
              {
                name: "Tôn Thất Anh Tuấn",
                role: "Team Member",
                desc: "Cùng team thực hiện đầy đủ quy trình phát triển và đảm bảo chất lượng sản phẩm.",
                avatar: "/img/team/qa-tester.png",
                fallbackEmoji: "👨‍💻",
                isLeader: false
              }
            ].map((member, index) => (
              <div key={index} style={{
                background: "white",
                borderRadius: "20px",
                padding: "2.5rem 2rem",
                textAlign: "center",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                minWidth: "280px"
              }}>
                <div style={{
                  marginBottom: "1rem",
                  display: "flex",
                  justifyContent: "center"
                }}>
                  <img 
                    src={member.avatar}
                    alt={member.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #fe9307",
                      boxShadow: "0 5px 15px rgba(254, 147, 7, 0.2)"
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #fe9307, #ff6b6b)",
                      display: "none",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.5rem",
                      border: "3px solid #fe9307"
                    }}
                  >
                    {member.fallbackEmoji}
                  </div>
                </div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "bold", 
                  color: "#2d3748",
                  marginBottom: "0.5rem",
                  lineHeight: "1.3"
                }}>
                  {member.name}
                </h3>
                <div style={{
                  color: "#fe9307",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  fontSize: "1rem"
                }}>
                  {member.role}
                </div>
                <p style={{ 
                  fontSize: "0.9rem", 
                  color: "#4a5568",
                  lineHeight: "1.5"
                }}>
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section style={{ padding: "6rem 0" }}>
        <div className="nhp-container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "bold", 
              color: "#2d3748",
              marginBottom: "1rem"
            }}>
              Giá trị cốt lõi
            </h2>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "#4a5568",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              Những nguyên tắc định hướng mọi hoạt động của chúng tôi
            </p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "2rem"
          }}>
            {[
              {
                icon: <Heart size={40} />,
                title: "Tận tâm",
                desc: "Đặt lợi ích khách hàng lên hàng đầu trong mọi quyết định"
              },
              {
                icon: <Shield size={40} />,
                title: "Tin cậy",
                desc: "Xây dựng lòng tin thông qua minh bạch và chất lượng"
              },
              {
                icon: <Rocket size={40} />,
                title: "Đổi mới",
                desc: "Không ngừng cải tiến công nghệ và trải nghiệm người dùng"
              },
              {
                icon: <Check size={40} />,
                title: "Chất lượng",
                desc: "Cam kết mang lại dịch vụ tốt nhất cho mọi khách hàng"
              }
            ].map((value, index) => (
              <div key={index} style={{
                background: "linear-gradient(135deg, #fe9307 0%, #ff6b6b 100%)",
                borderRadius: "20px",
                padding: "2.5rem",
                textAlign: "center",
                color: "white",
                transform: "translateY(0)",
                transition: "transform 0.3s ease"
              }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  {value.icon}
                </div>
                <h3 style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: "bold", 
                  marginBottom: "1rem"
                }}>
                  {value.title}
                </h3>
                <p style={{ 
                  fontSize: "1rem", 
                  opacity: "0.9",
                  lineHeight: "1.6"
                }}>
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section style={{ 
        background: "#f7fafc",
        padding: "6rem 0"
      }}>
        <div className="nhp-container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "bold", 
              color: "#2d3748",
              marginBottom: "1rem"
            }}>
              Công nghệ sử dụng
            </h2>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "#4a5568",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              Nền tảng được xây dựng với các công nghệ hiện đại nhất
            </p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "1.5rem",
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            {[
              "React.js", "Node.js", "MongoDB", "Socket.io", 
              "Redux", "Express.js", "ASP.NET Core Web API", "JWT", "Cloudinary"
            ].map((tech, index) => (
              <div key={index} style={{
                background: "white",
                borderRadius: "12px",
                padding: "1.5rem",
                textAlign: "center",
                border: "2px solid #fe9307",
                fontWeight: "600",
                color: "#2d3748",
                transition: "transform 0.3s ease"
              }}>
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: "6rem 0" }}>
        <div className="nhp-container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "bold", 
              color: "#2d3748",
              marginBottom: "1rem"
            }}>
              Tại sao chọn FixTech?
            </h2>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "#4a5568",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              Những lợi ích vượt trội khi sử dụng nền tảng của chúng tôi
            </p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "2rem",
            maxWidth: "1200px",
            margin: "0 auto"
          }}
          className="why-choose-grid"
          >
            {[
              {
                icon: <Shield size={50} />,
                title: "Thợ đã xác thực",
                desc: "Tất cả thợ đều được kiểm tra kỹ lưỡng về kỹ năng và uy tín"
              },
              {
                icon: <Lightbulb size={50} />,
                title: "Tìm kiếm thông minh",
                desc: "AI phân tích mô tả và tự động kết nối với thợ phù hợp nhất"
              },
              {
                icon: <Star size={50} />,
                title: "Đánh giá minh bạch",
                desc: "Hệ thống đánh giá từ khách hàng thực tế, hoàn toàn minh bạch"
              },
              {
                icon: <Heart size={50} />,
                title: "Hỗ trợ tận tình",
                desc: "Đội ngũ hỗ trợ sẵn sàng giúp đỡ bạn trong quá trình sử dụng"
              },
              {
                icon: <MapPin size={50} />,
                title: "Phủ sóng rộng",
                desc: "Có mặt tại 6 quận chính TP. Đà Nẵng với đội ngũ thợ dày dặn kinh nghiệm"
              },
              {
                icon: <Check size={50} />,
                title: "Thanh toán an toàn",
                desc: "Thanh toán trực tiếp với thợ sau khi hoàn thành, đảm bảo quyền lợi khách hàng"
              }
            ].map((item, index) => (
              <div key={index} style={{
                background: "#f7fafc",
                borderRadius: "15px",
                padding: "2.5rem",
                textAlign: "center",
                border: "1px solid #e2e8f0",
                transition: "transform 0.3s ease"
              }}>
                <div style={{ 
                  color: "#fe9307", 
                  marginBottom: "1.5rem",
                  display: "flex",
                  justifyContent: "center"
                }}>
                  {item.icon}
                </div>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "bold", 
                  color: "#2d3748",
                  marginBottom: "1rem"
                }}>
                  {item.title}
                </h3>
                <p style={{ 
                  fontSize: "1rem", 
                  color: "#4a5568",
                  lineHeight: "1.6"
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section style={{ 
        background: "linear-gradient(135deg, #fe9307 0%, #ff6b6b 100%)",
        padding: "6rem 0",
        color: "white",
        textAlign: "center"
      }}>
        <div className="nhp-container">
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "bold", 
              marginBottom: "2rem"
            }}>
              Cam kết của chúng tôi
            </h2>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gap: "2rem",
              marginBottom: "3rem",
              maxWidth: "1000px",
              margin: "0 auto 3rem auto"
            }}
            className="promise-grid"
            >
              {[
                {
                  icon: <Shield size={30} />,
                  title: "An toàn tuyệt đối",
                  desc: "Thợ được xác minh kỹ lưỡng"
                },
                {
                  icon: <Star size={30} />,
                  title: "Chất lượng đảm bảo",
                  desc: "Dịch vụ đạt chuẩn cao nhất"
                },
                {
                  icon: <Heart size={30} />,
                  title: "Hỗ trợ tận tình",
                  desc: "Luôn đồng hành cùng khách hàng"
                },
                {
                  icon: <Rocket size={30} />,
                  title: "Phát triển bền vững",
                  desc: "Không ngừng cải tiến và mở rộng"
                },
                {
                  icon: <Check size={30} />,
                  title: "Minh bạch tuyệt đối",
                  desc: "Thông tin công khai và rõ ràng"
                },
                {
                  icon: <Target size={30} />,
                  title: "Mục tiêu phục vụ",
                  desc: "Khách hàng là ưu tiên số một"
                }
              ].map((promise, index) => (
                <div key={index} style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "15px",
                  padding: "2rem",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)"
                }}>
                  <div style={{ marginBottom: "1rem" }}>
                    {promise.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: "bold", 
                    marginBottom: "0.5rem"
                  }}>
                    {promise.title}
                  </h3>
                  <p style={{ 
                    fontSize: "0.9rem", 
                    opacity: "0.9"
                  }}>
                    {promise.desc}
                  </p>
                </div>
              ))}
            </div>
            
            <p style={{ 
              fontSize: "1.2rem", 
              fontWeight: "600",
              opacity: "0.95"
            }}>
              "FixTech - Kết nối tin cậy, dịch vụ chất lượng"
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutPage;
