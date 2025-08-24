import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { 
  RiPhoneLine as Phone,
  RiMailLine as Mail,
  RiMapPinLine as MapPin,
  RiTimeLine as Clock,
  RiCustomerServiceLine as Support,
  RiSendPlaneLine as Send,
  RiFacebookLine as Facebook,
  RiInstagramLine as Instagram,
  RiTwitterLine as Twitter
} from "react-icons/ri";

function ContactPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

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
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "0.5rem",
              background: "rgba(255,255,255,0.2)",
              padding: "0.5rem 1.5rem",
              borderRadius: "50px",
              marginBottom: "2rem"
            }}>
              <Support size={20} />
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>LIÊN HỆ VỚI CHÚNG TÔI</span>
            </div>
            
            <h1 style={{ 
              fontSize: "3.5rem", 
              fontWeight: "900", 
              marginBottom: "1.5rem",
              lineHeight: "1.1"
            }}>
              Hỗ trợ & <span style={{ color: "#ffd700" }}>Tư vấn</span>
            </h1>
            
            <p style={{ 
              fontSize: "1.25rem", 
              opacity: "0.9", 
              lineHeight: "1.6"
            }}>
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. 
              Hãy liên hệ với chúng tôi qua các kênh dưới đây.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section style={{ padding: "6rem 0" }}>
        <div className="nhp-container">
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "4rem",
            alignItems: "start"
          }}>
            {/* Contact Info */}
            <div>
              <h2 style={{ 
                fontSize: "2.5rem", 
                fontWeight: "bold", 
                color: "#2d3748",
                marginBottom: "2rem"
              }}>
                Thông tin liên hệ
              </h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "1rem",
                  padding: "1.5rem",
                  background: "#f7fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ 
                    background: "#fe9307",
                    color: "white",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#2d3748" }}>
                      Hotline hỗ trợ
                    </h3>
                    <p style={{ color: "#4a5568", margin: "0" }}>0913 978 802</p>
                    <p style={{ color: "#718096", fontSize: "0.9rem", margin: "0" }}>
                      Hỗ trợ kỹ thuật và tư vấn
                    </p>
                  </div>
                </div>

                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "1rem",
                  padding: "1.5rem",
                  background: "#f7fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ 
                    background: "#fe9307",
                    color: "white",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#2d3748" }}>
                      Email hỗ trợ
                    </h3>
                    <p style={{ color: "#4a5568", margin: "0" }}>support@fixtech.vn</p>
                    <p style={{ color: "#718096", fontSize: "0.9rem", margin: "0" }}>
                      Phản hồi trong vòng 24h
                    </p>
                  </div>
                </div>

                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "1rem",
                  padding: "1.5rem",
                  background: "#f7fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ 
                    background: "#fe9307",
                    color: "white",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#2d3748" }}>
                      Khu vực hỗ trợ
                    </h3>
                    <p style={{ color: "#4a5568", margin: "0" }}>6 quận chính TP. Đà Nẵng</p>
                    <p style={{ color: "#718096", fontSize: "0.9rem", margin: "0" }}>
                      Hải Châu, Thanh Khê, Sơn Trà, Ngũ Hành Sơn, Liên Chiểu, Cẩm Lệ
                    </p>
                  </div>
                </div>

                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "1rem",
                  padding: "1.5rem",
                  background: "#f7fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ 
                    background: "#fe9307",
                    color: "white",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#2d3748" }}>
                      Giờ hỗ trợ
                    </h3>
                    <p style={{ color: "#4a5568", margin: "0" }}>8:00 - 20:00 (Thứ 2 - 7)</p>
                    <p style={{ color: "#718096", fontSize: "0.9rem", margin: "0" }}>
                      Chủ nhật: 9:00 - 17:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "2.5rem",
                boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                border: "1px solid #e2e8f0"
              }}>
                <h3 style={{ 
                  fontSize: "1.8rem", 
                  fontWeight: "bold", 
                  color: "#2d3748",
                  marginBottom: "1.5rem",
                  textAlign: "center"
                }}>
                  Gửi tin nhắn cho chúng tôi
                </h3>
                
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ 
                      display: "block", 
                      fontSize: "0.9rem", 
                      fontWeight: "600", 
                      color: "#2d3748",
                      marginBottom: "0.5rem"
                    }}>
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "1rem",
                        outline: "none",
                        transition: "border-color 0.3s ease"
                      }}
                      placeholder="Nhập họ và tên của bạn"
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div>
                      <label style={{ 
                        display: "block", 
                        fontSize: "0.9rem", 
                        fontWeight: "600", 
                        color: "#2d3748",
                        marginBottom: "0.5rem"
                      }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "1rem",
                          outline: "none"
                        }}
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: "block", 
                        fontSize: "0.9rem", 
                        fontWeight: "600", 
                        color: "#2d3748",
                        marginBottom: "0.5rem"
                      }}>
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "1rem",
                          outline: "none"
                        }}
                        placeholder="0912 345 678"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ 
                      display: "block", 
                      fontSize: "0.9rem", 
                      fontWeight: "600", 
                      color: "#2d3748",
                      marginBottom: "0.5rem"
                    }}>
                      Chủ đề
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "1rem",
                        outline: "none"
                      }}
                      placeholder="Tóm tắt nội dung cần hỗ trợ"
                    />
                  </div>

                  <div style={{ marginBottom: "2rem" }}>
                    <label style={{ 
                      display: "block", 
                      fontSize: "0.9rem", 
                      fontWeight: "600", 
                      color: "#2d3748",
                      marginBottom: "0.5rem"
                    }}>
                      Tin nhắn *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="5"
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "1rem",
                        outline: "none",
                        resize: "vertical"
                      }}
                      placeholder="Mô tả chi tiết vấn đề bạn cần hỗ trợ..."
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      background: "linear-gradient(135deg, #fe9307 0%, #ff6b6b 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "1rem 2rem",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "transform 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <Send size={20} />
                    Gửi tin nhắn
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section style={{ 
        background: "#f7fafc",
        padding: "4rem 0"
      }}>
        <div className="nhp-container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ 
              fontSize: "2rem", 
              fontWeight: "bold", 
              color: "#2d3748",
              marginBottom: "1rem"
            }}>
              Câu hỏi thường gặp
            </h2>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "#4a5568"
            }}>
              Một số câu hỏi phổ biến từ khách hàng
            </p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "1.5rem",
            maxWidth: "900px",
            margin: "0 auto"
          }}>
            {[
              {
                q: "FixTech hoạt động như thế nào?",
                a: "FixTech là nền tảng kết nối khách hàng với thợ sửa chữa. Bạn đặt lịch, hệ thống tìm thợ phù hợp."
              },
              {
                q: "Chi phí sử dụng ra sao?",
                a: "Hoàn toàn miễn phí đối với khách hàng. Bạn chỉ thanh toán chi phí sửa chữa trực tiếp với thợ."
              },
              {
                q: "Thợ có uy tín không?",
                a: "Tất cả thợ đều được xác thực kỹ lưỡng về kỹ năng và uy tín trước khi tham gia nền tảng."
              }
            ].map((item, index) => (
              <div key={index} style={{
                background: "white",
                borderRadius: "12px",
                padding: "1.5rem",
                border: "1px solid #e2e8f0"
              }}>
                <h4 style={{ 
                  fontSize: "1.1rem", 
                  fontWeight: "bold", 
                  color: "#2d3748",
                  marginBottom: "0.5rem"
                }}>
                  {item.q}
                </h4>
                <p style={{ 
                  fontSize: "0.95rem", 
                  color: "#4a5568",
                  lineHeight: "1.5",
                  margin: "0"
                }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ContactPage;
