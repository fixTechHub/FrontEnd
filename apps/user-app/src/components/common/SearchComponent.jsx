import { useState, useEffect } from "react"
import { RiSearchLine as Search, RiMessage3Line as MessageCircle, RiSparklingFill as Sparkles } from "react-icons/ri"

export default function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  const placeholderTexts = [
    "Nhập mô tả tình trạng thiết bị...",
    "VD: Tủ lạnh không đông đá",
    "VD: Máy giặt kêu to, không vắt",
    "VD: Điều hòa không mát, rò gas",
    "VD: TV không lên hình, chỉ có tiếng",
  ]

  const popularSearches = ["Tủ lạnh", "Máy giặt", "Điều hòa", "TV", "Lò vi sóng"]

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (query) => setSearchQuery(query)

  return (
    <div className="search-container">
      <div className={`search-box ${isSearchFocused ? "focused" : ""}`}>        
        <div className="search-input">
          <div className="search-input-content">
            <div className="search-icon">
              <Search
                size={24}
                color="white"
                style={{
                  transform: isSearchFocused ? "scale(1.1) rotate(12deg)" : "scale(1)",
                  transition: "transform 0.3s ease",
                }}
              />
            </div>
            <input
              type="text"
              className="search-field"
              placeholder={placeholderTexts[placeholderIndex]}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            <div className="search-buttons">
              <button className="btn btn-ghost" style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", flexShrink: 0 }}>
                <MessageCircle size={20} />
              </button>
              <button className="btn" style={{ padding: "0 2rem", height: "3rem", borderRadius: "0.75rem", flexShrink: 0 }}>
                <Search size={20} style={{ marginRight: "0.5rem" }} />
                <span className="search-text">Tìm kiếm</span>
                <Sparkles size={16} style={{ marginLeft: "0.5rem" }} />
              </button>
            </div>
          </div>
        </div>
        <div className="popular-searches">
          <span style={{ fontSize: "0.875rem", color: "#6b7280", fontWeight: 500, marginRight: "0.5rem" }}>Tìm kiếm phổ biến:</span>
          {popularSearches.map((txt, i) => (
            <button key={i} className="popular-search-btn" onClick={() => handleSearch(txt)}>
              <Sparkles size={12} style={{ marginRight: "0.25rem" }} />
              {txt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}