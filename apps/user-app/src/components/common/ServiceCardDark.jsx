import "./ServiceCardDark.css";
import { RiStarFill as Star, RiPhoneFill as Phone } from "react-icons/ri";

export default function ServiceCardDark({ icon: Icon, title, responseTime, serviceFeature, color, bg, description, features }) {
  return (
    <div className="glass-card" style={{ "--icon-bg": bg, "--icon-color": color }}>
      {/* Front content */}
      <div className="front">
        <div className="icon-glass">
          <Icon size={26} />
        </div>
        <h3 className="glass-title">{title}</h3>
        <span className="response-time-tag">{responseTime}</span>
        <div className="service-feature-wrap">
          <span className="service-feature-tag">{serviceFeature}</span>
        </div>
        <span className="contact-tag"><Star size={13} style={{marginRight:"0.3rem"}}/>Phổ biến</span>
      </div>

      {/* Overlay description with pills */}
      <div className="details-overlay">
        {features && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
            {features.slice(0, 6).map((feat, idx) => (
              <span key={idx} className="pill">
                <feat.icon size={12} /> {feat.text}
              </span>
            ))}
          </div>
        )}
        {description && <p style={{ margin: 0 }}>{description}</p>}
      </div>
    </div>
  );
}
