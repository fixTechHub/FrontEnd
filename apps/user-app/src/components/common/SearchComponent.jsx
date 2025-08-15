import { useState, useEffect } from "react"
import { 
  RiSearchLine as Search, 
  RiMessage3Line as MessageCircle, 
  RiSparklingFill as Sparkles,
  RiRocketLine as Rocket,
  RiFireLine as Fire,
  RiStarFill as Star,
  RiMagicLine as Magic,
  RiLightbulbLine as Lightbulb,
  RiHome2Line as Refrigerator,
  RiSettings3Line as Wrench,
  RiWindyLine as AirVent,
  RiTvLine as Tv,
  RiFlashlightLine as Flash,
  RiCheckLine as Target,
  RiTrophyLine as Trophy,
  RiMicLine as Mic
} from "react-icons/ri"
// Styles now included in homepage-complete.css

export default function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  const placeholderTexts = [
    "Mô tả tình trạng thiết bị của bạn để tìm thợ phù hợp...",
    "VD: Tủ lạnh không đông đá, kêu to bất thường",
    "VD: Máy giặt không vắt, nước không thoát ra", 
    "VD: Điều hòa không mát, có mùi khó chịu",
    "VD: TV không lên hình, chỉ có tiếng không có hình",
    "VD: Lò vi sóng không nóng được, đèn báo sáng"
  ]

  const popularSearches = [
    { text: "Tủ lạnh không lạnh", icon: Refrigerator },
    { text: "Máy giặt kêu to", icon: Wrench },
    { text: "Điều hòa rò gas", icon: AirVent },
    { text: "TV hỏng màn hình", icon: Tv },
    { text: "Lò vi sóng không nóng", icon: Fire }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1000)
  }

  return (
    <div className="search-container-enhanced">
      {/* Hero Search Title */}
      <div className="search-hero-title">
        <div className="search-badge">
          <Sparkles size={20} className="sparkle-icon" />
          <span>TÌM KIẾM THÔNG MINH</span>
          <Magic size={20} className="magic-icon" />
        </div>
        <h2 className="search-main-title">
          Mô tả tình trạng - Tìm thợ phù hợp
        </h2>
        <p className="search-subtitle">
          <Rocket size={16} /> AI sẽ phân tích mô tả của bạn và đề xuất các thợ chuyên môn phù hợp nhất
        </p>
      </div>

      {/* Enhanced Search Box */}
      <div className={`search-box-enhanced ${isSearchFocused ? "focused" : ""} ${isTyping ? "typing" : ""}`}>
        <div className="search-glow-effect"></div>
        <div className="search-input-enhanced">
          <div className="search-icon-enhanced">
            <Search
              size={28}
              className="search-icon-main"
              style={{
                transform: isSearchFocused ? "scale(1.2) rotate(12deg)" : "scale(1)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            <div className="search-pulse-ring"></div>
          </div>
          
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-field-enhanced"
              placeholder={placeholderTexts[placeholderIndex]}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            <div className="search-typing-indicator">
              {isTyping && <span className="typing-dots">AI đang phân tích...</span>}
            </div>
          </div>

          <div className="search-actions-enhanced">
            <button className="btn-search-enhanced">
              <div className="btn-search-content">
                <Fire size={22} className="fire-icon" />
                <span className="search-text-enhanced">Tìm thợ ngay</span>
                <Star size={18} className="star-icon" />
              </div>
              <div className="btn-search-bg"></div>
            </button>
          </div>
        </div>

        {/* Enhanced Popular Searches */}
        <div className="popular-searches-enhanced">
          <div className="popular-label">
            <Lightbulb size={16} className="lightbulb-icon" />
            <span>Mô tả phổ biến:</span>
          </div>
          <div className="popular-tags">
            {popularSearches.map((search, i) => (
              <button 
                key={i} 
                className="popular-tag-enhanced" 
                onClick={() => handleSearch(search.text)}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <search.icon size={16} className="tag-icon" />
                <span className="tag-text">{search.text}</span>
                <Sparkles size={12} className="tag-sparkle" />
              </button>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="search-trust-indicators">
          <div className="trust-item">
            <Flash size={20} className="trust-icon" />
            <span>Tức thì</span>
          </div>
          <div className="trust-item">
            <Target size={20} className="trust-icon" />
            <span>Chính xác</span>
          </div>
          <div className="trust-item">
            <Trophy size={20} className="trust-icon" />
            <span>Uy tín</span>
          </div>
        </div>
      </div>

      {/* Floating elements for visual appeal */}
      <div className="search-floating-elements">
        <div className="floating-sparkle floating-sparkle-1">
          <Sparkles size={20} />
        </div>
        <div className="floating-sparkle floating-sparkle-2">
          <Star size={20} />
        </div>
        <div className="floating-sparkle floating-sparkle-3">
          <Magic size={20} />
        </div>
        <div className="floating-sparkle floating-sparkle-4">
          <Wrench size={20} />
        </div>
      </div>
    </div>
  )
}