import { useState } from "react"
import { RiSparklingFill as Sparkles, RiArrowDownSLine as ChevronDown } from "react-icons/ri"

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null)

  const faqs = [
    {
      question: "FixTech hoạt động như thế nào?",
      answer:
        "FixTech là nền tảng kết nối khách hàng với các thợ sửa chữa thiết bị gia dụng tại Đà Nẵng. Bạn đặt lịch trên website, hệ thống sẽ tìm kiếm và kết nối với thợ phù hợp trong khu vực.",
    },
    {
      question: "Giá sửa chữa như thế nào?",
      answer:
        "Giá sửa chữa do mỗi thợ tự quyết định dựa trên mức độ hỏng hóc và linh kiện cần thay. Thợ sẽ báo giá cụ thể sau khi kiểm tra thiết bị tại nhà bạn. Bạn chỉ thanh toán khi đồng ý với báo giá.",
    },
    {
      question: "Thời gian bảo hành ra sao?",
      answer:
        "Thời gian bảo hành và chính sách bảo hành tùy thuộc vào từng thợ. Mỗi thợ có mức bảo hành khác nhau cho dịch vụ của họ. Thông tin này sẽ được thợ thông báo trước khi thực hiện sửa chữa.",
    },
    {
      question: "Khu vực nào được hỗ trợ?",
      answer:
        "Hiện tại FixTech hỗ trợ kết nối thợ tại 6 quận chính của TP.Đà Nẵng: Hải Châu, Thanh Khê, Sơn Trà, Ngũ Hành Sơn, Liên Chiểu, Cẩm Lệ. Chúng tôi đang mở rộng thêm khu vực khác.",
    },
    {
      question: "Thợ có làm việc cuối tuần không?",
      answer:
        "Thời gian làm việc tùy thuộc vào từng thợ. Một số thợ làm việc cả cuối tuần, một số chỉ làm thứ 2-6. Bạn có thể xem thời gian làm việc của thợ khi đặt lịch trên hệ thống.",
    },
  ]

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section className="nhp-faq-section">
      <div className="nhp-container">
        <div className="nhp-section-header-enhanced">
          <div className="nhp-section-badge-enhanced">
            <Sparkles size={20} />
            <span>CÂU HỎI THƯỜNG GẶP</span>
            <Sparkles size={20} />
          </div>
          <h2 className="nhp-section-title-enhanced">Giải đáp thắc mắc</h2>
          <p className="nhp-section-description-enhanced">
            Những câu hỏi thường gặp từ khách hàng về dịch vụ sửa chữa của chúng tôi
          </p>
        </div>

        <div className="nhp-faq-container">
          {faqs.map((faq, index) => (
            <div key={index} className={`nhp-faq-item-enhanced ${activeIndex === index ? "active" : ""}`}>
              <button className="nhp-faq-question-enhanced" onClick={() => toggleFAQ(index)}>
                <span>{faq.question}</span>
                <ChevronDown size={20} className="nhp-faq-icon" />
              </button>
              <div className="nhp-faq-answer-enhanced">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}