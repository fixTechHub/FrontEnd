import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage, addUserMessage, clearConversation } from '../../features/chatbox/chatboxSlice';
import { Button, Form } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { MdSupportAgent } from 'react-icons/md';

// Custom renderer for links to replace specific text with "chọn thợ"
const transformMessage = (text) => {
  // Regex to match the specific pattern: "Bạn có thể chọn kỹ thuật viên phù hợp tại đây: <URL>"
  const linkRegex = /(https?:\/\/[^\s]+)/;
  return text.replace(linkRegex, '[chọn thợ]($1)');
};

const AIChatbox = () => {
  const dispatch = useDispatch();
  const { messages, status, error } = useSelector((state) => state.aiChat);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messageContainerRef = useRef(null);

  // Scroll to bottom of message container when new messages are added
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) {
      alert('Vui lòng nhập nội dung cần hỗ trợ.');
      return;
    }

    dispatch(addUserMessage(input));
    dispatch(sendChatMessage({ message: input }));
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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

  // Custom components for ReactMarkdown to handle links
  const markdownComponents = {
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary fw-semibold">
        {children}
      </a>
    ),
  };

  return (
    <div className="position-fixed bottom-0 end-0 mb-3 me-3 z-3 font-sans">
      {/* Chat Icon */}
      <Button
        onClick={toggleChatbox}
        className="rounded-circle d-flex align-items-center justify-content-center shadow-lg border-0"
        style={{ width: '50px', height: '50px', background: '' }}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        {isOpen ? (
          <>x</>
        ) : (
          <MdSupportAgent className="w-100 h-100 text-gray-600" />
        )}
      </Button>

      {/* Chatbox */}
      <div
        className={`bg-white rounded-3 shadow-lg d-flex flex-column transition-all duration-500 ease-in-out position-absolute bottom-100 end-0 border border-light-subtle ${
          isOpen ? '' : 'translate-y-100 opacity-0 pointer-events-none'
        }`}
        style={{ width: '300px', maxHeight: '60vh' }}
      >
        {/* Header */}
        <div
          className="p-2 rounded-top-3 text-white d-flex align-items-center justify-content-between"
          style={{ background: '#FFA633', minHeight: '60px' }}
        >
          <div className="d-flex align-items-center">
            <MdSupportAgent className="text-gray-600" style={{ fontSize: '24px' }} />
            <span className="fs-6 fw-semibold ms-2">Hỗ Trợ</span>
          </div>
          <Button
            variant="link"
            onClick={toggleChatbox}
            className="text-white text-decoration-none p-1"
            aria-label="Đóng chat"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Message Area */}
        <div
          ref={messageContainerRef}
          className="flex-grow-1 p-2 overflow-y-auto bg-light-subtle"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#adb5bd #e9ecef' }}
        >
          {messages.length === 0 && (
            <div className="text-center small py-2">
              Bắt đầu cuộc trò chuyện bằng cách nhập tin nhắn!
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 mb-2 rounded-2 small text-start ${
                msg.sender === 'user' ? 'ms-auto bg-primary-subtle text-primary-emphasis' : 'bg-white text-dark border border-light-subtle'
              }`}
              style={{ maxWidth: '80%', wordWrap: 'break-word' }}
            >
              <ReactMarkdown components={markdownComponents}>
                {msg.sender === 'bot' ? transformMessage(msg.text) : msg.text}
              </ReactMarkdown>
              <span className="text d-block small">{formatTimestamp(msg.timestamp)}</span>
            </div>
          ))}
          {status === 'loading' && (
            <div className="p-2 mb-2 bg-white rounded-2 small d-flex align-items-center border border-light-subtle">
              <div className="d-flex gap-1 me-2">
                <span className="d-block w-2 h-2 bg-primary rounded-circle animate-bounce"></span>
                <span
                  className="d-block w-2 h-2 bg-primary rounded-circle animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></span>
                <span
                  className="d-block w-2 h-2 bg-primary rounded-circle animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></span>
              </div>
              <span className="text fst-italic">Đang xử lý...</span>
            </div>
          )}
          {error && <div className="text-danger text-center small py-2">{error}</div>}
        </div>

        {/* Input Area */}
        <div className="p-2 border-top bg-white">
          <div className="d-flex align-items-center gap-2">
            <Form.Control
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow-1 py-1 border rounded-2 shadow-sm"
              placeholder="Nhập vấn đề của bạn..."
              aria-label="Nhập tin nhắn"
            />
            <Button
              onClick={handleSendMessage}
              className="send-btn"
              style={{ background: '#FFA633' }}
              aria-label="Gửi tin nhắn"
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbox;