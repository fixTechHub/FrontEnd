import { useState } from "react"
import { RiSparklingFill as Sparkles, RiArrowDownSLine as ChevronDown } from "react-icons/ri"

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null)

  const faqs = [
    {
      question: "Thời gian sửa chữa mất bao lâu?",
      answer:
        "Thời gian sửa chữa phụ thuộc vào loại thiết bị và mức độ hỏng hóc. Thông thường, các sự cố đơn giản có thể được khắc phục trong 1-2 giờ. Các trường hợp phức tạp có thể mất 1-2 ngày để đặt hàng linh kiện.",
    },
    {
      question: "Chi phí sửa chữa như thế nào?",
      answer:
        "Chúng tôi báo giá minh bạch trước khi sửa chữa. Chi phí bao gồm tiền công và linh kiện (nếu có). Khách hàng chỉ thanh toán khi đồng ý với báo giá và hài lòng với kết quả.",
    },
    {
      question: "Có bảo hành sau khi sửa chữa không?",
      answer:
        "Có, chúng tôi bảo hành lên đến 6 tháng tùy vào từng loại dịch vụ sửa chữa. Bảo hành bao gồm cả công sửa chữa và linh kiện thay thế. Nếu có sự cố trong thời gian bảo hành, chúng tôi sẽ sửa chữa miễn phí.",
    },
    {
      question: "Khu vực nào được hỗ trợ?",
      answer:
        "Chúng tôi hỗ trợ tất cả các quận huyện tại TP.Đà Nẵng và khu vực lân cận như Quảng Nam. Thời gian di chuyển thường trong vòng 30-60 phút tùy khu vực.",
    },
    {
      question: "Có sửa chữa vào cuối tuần không?",
      answer:
        "Có, chúng tôi làm việc 7 ngày/tuần, bao gồm cả cuối tuần và ngày lễ. Dịch vụ khẩn cấp 24/7 cho các trường hợp cần thiết với phụ phí hợp lý.",
    },
  ]

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section className="faq-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <Sparkles size={24} style={{ animation: "pulse 2s ease-in-out infinite" }} />
            <span>CÂU HỎI THƯỜNG GẶP</span>
            <Sparkles size={24} style={{ animation: "pulse 2s ease-in-out infinite" }} />
          </div>
          <h2 className="section-title">Giải đáp thắc mắc</h2>
          <p className="section-description">
            Những câu hỏi thường gặp từ khách hàng về dịch vụ sửa chữa của chúng tôi
          </p>
        </div>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? "active" : ""}`}>
              <button className="faq-question" onClick={() => toggleFAQ(index)}>
                <span>{faq.question}</span>
                <ChevronDown size={20} className="faq-icon" />
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}