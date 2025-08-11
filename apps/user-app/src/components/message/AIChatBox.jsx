import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage, addUserMessage, clearConversation } from '../../features/chatbox/chatboxSlice';
import { Button, Form } from 'react-bootstrap';
import { MdSupportAgent } from 'react-icons/md';
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

  // Scroll to bottom of message container when new messages are added
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) {
      toast.error('Vui lòng nhập nội dung cần hỗ trợ.');
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

  return (
    <div className="position-fixed bottom-0 end-0 mb-3 me-3 z-3 font-sans">
      {/* Chat Icon */}
      <Button
        onClick={toggleChatbox}
        className="rounded-circle d-flex align-items-center justify-content-center shadow-lg border-0"
        style={{ width: '50px', height: '50px', background: '#FFA633' }}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        {isOpen ? (
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>×</span>
        ) : (
          <MdSupportAgent className="w-100 h-100 text-white" />
        )}
      </Button>

      {/* Chatbox */}
      <div
        className={`bg-white rounded-3 shadow-lg d-flex flex-column position-absolute bottom-100 end-0 border border-light-subtle ${
          isOpen ? '' : 'd-none'
        }`}
        style={{ width: '400px', maxHeight: '60vh' }}
      >
        {/* Header */}
        <div
          className="p-2 rounded-top-3 text-white d-flex align-items-center justify-content-between"
          style={{ background: '#FFA633', minHeight: '60px' }}
        >
          <div className="d-flex align-items-center">
            <MdSupportAgent className="text-white" style={{ fontSize: '24px' }} />
            <span className="fs-6 fw-semibold ms-2">Gia Dụng Pro</span>
          </div>
          <Button
            variant="link"
            onClick={toggleChatbox}
            className="text-white text-decoration-none p-1"
            aria-label="Đóng chat"
          >
            <svg
              width="16"
              height="16"
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
          style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: '#adb5bd #e9ecef',
            minHeight: '200px',
            maxHeight: '400px'
          }}
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
              <SimpleMarkdown>
                {msg.sender === 'bot' ? transformMessage(msg.text) : msg.text}
              </SimpleMarkdown>
              <span className="text d-block small mt-1">{formatTimestamp(msg.timestamp)}</span>
            </div>
          ))}
          {status === 'loading' && (
            <div className="p-2 mb-2 bg-white rounded-2 small d-flex align-items-center border border-light-subtle">
              <div className="d-flex gap-1 me-2">
                <span className="d-block rounded-circle bg-primary bounce" style={{ width: '6px', height: '6px' }}></span>
                <span 
                  className="d-block rounded-circle bg-primary bounce" 
                  style={{ width: '6px', height: '6px', animationDelay: '0.16s' }}
                ></span>
                <span 
                  className="d-block rounded-circle bg-primary bounce" 
                  style={{ width: '6px', height: '6px', animationDelay: '0.32s' }}
                ></span>
              </div>
              <span className="text-muted fst-italic"></span>
            </div>
          )}
          {error && <div className="text-danger text-center small py-2">{error}</div>}
        </div>

        {/* Input Area */}
        <div className="p-2 border-top bg-white rounded-bottom-3">
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
              className="d-flex align-items-center justify-content-center border-0"
              style={{ 
                background: '#FFA633',
                width: '36px',
                height: '36px'
              }}
              aria-label="Gửi tin nhắn"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
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