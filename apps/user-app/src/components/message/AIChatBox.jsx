import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage, addUserMessage, clearConversation } from '../../features/chatbox/chatboxSlice';
import { Button, Form } from 'react-bootstrap';
import { MdSupportAgent, MdKeyboardArrowDown, MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';
import './MessageBox.css';

// Simple markdown renderer that handles basic formatting
const SimpleMarkdown = ({ children, className = "" }) => {
  const renderText = (text) => {
    if (!text || typeof text !== 'string') return text;

    const parts = [];
    const lines = text.split('\n');

    lines.forEach((line, lineIndex) => {
      // Handle bold (**text**), italic (*text*), and links ([text](url))
      const inlineRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^\*]+)\*\*|\*([^\*]+)\*/g;
      let lastIndex = 0;
      let match;

      // Handle list items (* Item or - Item)
      if (line.match(/^\s*[*-]\s+(.+)/)) {
        const listMatch = line.match(/^\s*[*-]\s+(.+)/);
        parts.push(
          <li key={`line-${lineIndex}`} style={{ marginLeft: '1em' }}>
            {renderInline(listMatch[1], lineIndex)}
          </li>
        );
      } else {
        // Process inline markdown for non-list lines
        const lineParts = [];
        while ((match = inlineRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            lineParts.push(line.slice(lastIndex, match.index));
          }

          if (match[1] && match[2]) {
            // Handle links [text](url)
            lineParts.push(
              <a
                key={`inline-${lineIndex}-${match.index}`}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary fw-semibold text-decoration-none"
                style={{ cursor: 'pointer' }}
              >
                {match[1]}
              </a>
            );
          } else if (match[3]) {
            // Handle bold **text**
            lineParts.push(<strong key={`inline-${lineIndex}-${match.index}`}>{match[3]}</strong>);
          } else if (match[4]) {
            // Handle italic *text*
            lineParts.push(<em key={`inline-${lineIndex}-${match.index}`}>{match[4]}</em>);
          }

          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < line.length) {
          lineParts.push(line.slice(lastIndex));
        }

        parts.push(
          <span key={`line-${lineIndex}`} style={{ display: 'block' }}>
            {lineParts.length > 0 ? lineParts : line}
          </span>
        );
      }
    });

    // Wrap consecutive list items in <ul>
    const wrappedParts = [];
    let listItems = [];
    let inList = false;

    parts.forEach((part, index) => {
      if (React.isValidElement(part) && part.type === 'li') {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(part);
      } else {
        if (inList) {
          wrappedParts.push(<ul key={`ul-${index}`}>{listItems}</ul>);
          inList = false;
          listItems = [];
        }
        wrappedParts.push(part);
      }
    });

    if (inList) {
      wrappedParts.push(<ul key={`ul-end`}>{listItems}</ul>);
    }

    return wrappedParts.length > 0 ? wrappedParts : text;
  };

  // Helper function to process inline markdown within list items
  const renderInline = (text, lineIndex) => {
    const inlineRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^\*]+)\*\*|\*([^\*]+)\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = inlineRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      if (match[1] && match[2]) {
        parts.push(
          <a
            key={`inline-list-${lineIndex}-${match.index}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary fw-semibold text-decoration-none"
            style={{ cursor: 'pointer' }}
          >
            {match[1]}
          </a>
        );
      } else if (match[3]) {
        parts.push(<strong key={`inline-list-${lineIndex}-${match.index}`}>{match[3]}</strong>);
      } else if (match[4]) {
        parts.push(<em key={`inline-list-${lineIndex}-${match.index}`}>{match[4]}</em>);
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={className}>
      {renderText(children)}
    </div>
  );
};

// Custom renderer for links to replace specific text with "chọn thợ"
const transformMessage = (text) => {
  const linkRegex = /(https?:\/\/[^\s]+)/;
  return text.replace(linkRegex, '[chọn thợ]($1)');
};

const AIChatbox = () => {
  const dispatch = useDispatch();
  const { messages, status, error } = useSelector((state) => state.aiChat);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messageContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom of message container when new messages are added
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-expand textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; // Maximum height (about 4-5 lines)
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleSendMessage = () => {
    if (!input.trim()) {
      toast.error('Vui lòng nhập nội dung cần hỗ trợ.');
      return;
    }

    dispatch(addUserMessage(input));
    dispatch(sendChatMessage({ message: input }));
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearConversation = () => {
    dispatch(clearConversation());
  };

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  // Format timestamp for messages
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="position-fixed bottom-0 end-0 mb-3 me-3 z-3 font-sans">
      {/* Modern AI Chat Button */}
      <div className="ai-chat-wrapper position-relative">
        {/* AI Badge */}
        <div className="ai-badge">
          <span className="ai-text">AI</span>
          <div className="ai-sparkles">
            <div className="sparkle sparkle-1">✨</div>
            <div className="sparkle sparkle-2">✨</div>
            <div className="sparkle sparkle-3">⭐</div>
          </div>
        </div>
        
        {/* Speech Bubble Preview */}
        {!isOpen && (
          <div className="speech-bubble-preview">
            <div className="bubble-content">
              <div className="bubble-text">
                <div className="bubble-title">Trợ Lý AI sẵn sàng hỗ trợ!</div>
                <div className="bubble-subtitle">Mô tả thiết bị hỏng để tìm thợ phù hợp</div>
              </div>
            </div>
            <div className="bubble-tail"></div>
          </div>
        )}
        
              <Button
          onClick={toggleChatbox}
          className={`modern-ai-btn rounded-circle d-flex align-items-center justify-content-center border-0 position-relative overflow-hidden ${isOpen ? 'btn-hidden' : 'btn-visible'}`}
          style={{ width: '64px', height: '64px' }}
          aria-label={isOpen ? 'Đóng Trợ Lý AI' : 'Mở Trợ Lý AI'}
        >
          <div className="ai-btn-bg"></div>
          <div className="ai-btn-glow"></div>
          
                  {isOpen ? (
            <MdKeyboardArrowDown className="close-btn-icon" style={{ 
              fontSize: '28px', 
              zIndex: 3,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white'
            }} />
          ) : (
            <div className="ai-icon-wrapper" style={{ zIndex: 3 }}>
              <MdSupportAgent className="ai-main-icon" style={{ fontSize: '30px' }} />
              <div className="ai-thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div className="ai-pulse-ring"></div>
          <div className="ai-pulse-ring-2"></div>
      </Button>
      </div>

      {/* Enhanced Chatbox */}
      <div
        className={`chatbox-container bg-white rounded-4 shadow-lg d-flex flex-column position-absolute bottom-100 end-0 overflow-hidden ${
          isOpen ? 'chatbox-open' : 'd-none'
        }`}
        style={{ width: '420px', maxHeight: '65vh' }}
      >
        {/* AI Header */}
        <div className="ai-chatbox-header p-3 text-white d-flex align-items-center justify-content-between position-relative overflow-hidden">
          <div className="chatbox-header-bg"></div>
          <div className="header-glow"></div>
          
          <div className="d-flex align-items-center position-relative" style={{ zIndex: 2 }}>
            <div className="ai-avatar-container position-relative">
              <div className="ai-avatar-bg"></div>
              <MdSupportAgent className="text-white ai-avatar-icon" style={{ fontSize: '26px' }} />
              <div className="ai-status-indicator">
                <div className="ai-brain-wave"></div>
              </div>
            </div>
            <div className="ms-3">
              <div className="ai-title d-flex align-items-center gap-2">
                <span className="fs-6 fw-bold">Trợ Lý AI</span>
                <div className="ai-badge-mini">✨</div>
              </div>
              <div className="ai-status d-flex align-items-center gap-1" style={{ fontSize: '11px', opacity: 0.9 }}>
                <div className="typing-indicator-mini">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Sẵn sàng hỗ trợ</span>
              </div>
            </div>
          </div>
          
          <Button
            variant="link"
            onClick={toggleChatbox}
            className="ai-close-btn text-white text-decoration-none rounded-circle position-relative"
            style={{ zIndex: 2 }}
            aria-label="Đóng Trợ Lý AI"
          >
            <MdClose style={{ fontSize: '20px' }} />
          </Button>
        </div>

        {/* Enhanced Message Area */}
        <div
          ref={messageContainerRef}
          className="chatbox-messages flex-grow-1 p-3 overflow-y-auto"
          style={{ 
            minHeight: '220px',
            maxHeight: '420px'
          }}
        >
          {messages.length === 0 && (
            <div className="ai-welcome-section">
              <div className="welcome-animation">
                <div className="ai-greeting-bubble">
                  <div className="ai-avatar-mini">
                    <MdSupportAgent style={{ fontSize: '16px' }} />
                  </div>
                  <div className="greeting-content">
                    <div className="greeting-text">
                      👋 Xin chào! Tôi là <strong>Trợ Lý AI</strong>
                    </div>
                    <div className="greeting-subtext">
                      Hãy mô tả <strong>chi tiết tình trạng thiết bị</strong> (lỗi gì, triệu chứng ra sao) để tôi tìm thợ phù hợp và đưa ra giải pháp tốt nhất cho bạn!
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="quick-actions">
                <div className="quick-actions-title">💡 Ví dụ mô tả chi tiết:</div>
                <div className="quick-action-buttons">
                  <button 
                    className="quick-btn"
                    onClick={() => setInput('Máy giặt Samsung 9kg bị lỗi không vắt, quần áo vẫn ướt đẫm sau khi giặt xong. Máy không báo lỗi gì, chỉ dừng ở chế độ xả nước')}
                  >
                    🔧 Máy giặt chi tiết
                  </button>
                  <button 
                    className="quick-btn"
                    onClick={() => setInput('Điều hòa Daikin 1.5HP phòng 20m2, bật lên nhưng không thổi khí lạnh, quạt trong chạy bình thường, đèn báo xanh sáng')}
                  >
                    ❄️ Điều hòa chi tiết
                  </button>
                  <button 
                    className="quick-btn"
                    onClick={() => setInput('Tủ lạnh Electrolux 180L kêu to từ 2 ngày nay, tiếng kêu như động cơ bị kẹt, tủ vẫn lạnh bình thường')}
                  >
                    🧊 Tủ lạnh chi tiết
                  </button>
                  <button 
                    className="quick-btn"
                    onClick={() => setInput('Bếp từ Sunhouse bị lỗi E3, không nhận nồi, thử nhiều loại nồi từ khác nhau đều không được')}
                  >
                    🍳 Bếp từ chi tiết
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-bubble">
                  <SimpleMarkdown>
                    {msg.sender === 'bot' ? transformMessage(msg.text) : msg.text}
                  </SimpleMarkdown>
                  <div className="message-time">{formatTimestamp(msg.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
          {status === 'loading' && (
            <div className="chat-message bot-message">
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="typing-text">AI đang soạn tin...</div>
              </div>
            </div>
          )}
          {error && <div className="text-danger text-center small py-2">{error}</div>}
        </div>

        {/* Enhanced Input Area */}
        <div className="chatbox-input-area p-3 border-top">
          <div className="input-wrapper d-flex align-items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chat-input flex-grow-1 border-0 shadow-none resize-none"
              placeholder="Mô tả chi tiết thiết bị: loại gì, lỗi như thế nào, triệu chứng ra sao..."
              aria-label="Nhập tin nhắn"
              rows={1}
              style={{ 
                minHeight: '42px',
                maxHeight: '120px',
                overflow: 'auto'
              }}
            />
            <Button
              onClick={handleSendMessage}
              className="send-btn d-flex align-items-center justify-content-center border-0 rounded-circle position-relative overflow-hidden"
              aria-label="Gửi tin nhắn"
              disabled={!input.trim()}
            >
              <div className="send-btn-bg"></div>
              <svg
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
                style={{ zIndex: 2 }}
              >
                <path d="M15.854.146a.5.5 0 0 1 .11.54L13.026 8.47A.5.5 0 0 1 12.5 8.75H8.75v3.75a.5.5 0 0 1-.47.474l-7.838 2.938a.5.5 0 0 1-.54-.11.5.5 0 0 1-.11-.54L2.73 7.47A.5.5 0 0 1 3.25 7.25H7V3.5a.5.5 0 0 1 .47-.474l-7.838-2.938a.5.5 0 0 1 .54.11z"/>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbox;