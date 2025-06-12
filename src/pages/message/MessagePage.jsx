import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchBookingThunk } from '../features/bookings/bookingSlice';
import { fetchMessagesThunk, addMessage } from '../features/messages/messageSlice';
import { sendMessage, onReceiveMessage } from '../services/socketService';

const MessagePage = () => {
  const { bookingId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { booking, loading: bookingLoading, error: bookingError } = useSelector((state) => state.bookings);
  const { messages, loading: messagesLoading, error: messagesError } = useSelector((state) => state.messages);
  const [messageContent, setMessageContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingThunk(bookingId));
      dispatch(fetchMessagesThunk(bookingId));
    }

    const cleanup = onReceiveMessage((newMessage) => {
      console.log('Comparing bookingId:', newMessage.bookingId.toString(), bookingId);
      if (newMessage.bookingId.toString() === bookingId) {
        dispatch(addMessage(newMessage));
      }
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [dispatch, bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageContent.trim() && !selectedFile) || !user || !booking) return;

    const userRole = user.role.name;
    const toUserId = userRole === 'Technician' ? booking.customerId : booking.technicianId;

    const message = {
      bookingId,
      fromUser: user._id,
      toUser: toUserId,
      type: 'SERVICE',
      createdAt: new Date().toISOString(),
    };

    if (selectedFile) {
      const base64 = await convertFileToBase64(selectedFile);
      message.fileBase64 = base64;
      message.originalName = selectedFile.name;
      message.mimetype = selectedFile.type;
    } else {
      message.content = messageContent;
    }

    sendMessage(message);
    setMessageContent('');
    setSelectedFile(null);
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  if (bookingLoading || messagesLoading) return <div>Loading...</div>;
  if (bookingError) return <div>Error: {bookingError}</div>;
  if (messagesError) return <div>Error: {messagesError}</div>;
  if (!booking) return <div>No booking found</div>;

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Chat for Booking #{booking.bookingCode}</h2>

      <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow">
        {[...messages]
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).setHours(0, 0, 0, 0);
            const dateB = new Date(b.createdAt).setHours(0, 0, 0, 0);
            return dateA - dateB;
          })
          .map((msg, index) => (
            <div
              key={msg._id || `${msg.fromUser}-${msg.createdAt}-${index}`}
              className={`mb-4 ${msg.fromUser === user._id ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  msg.fromUser === user._id ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {msg.content && (msg.content.startsWith('data:image') || /\.(png|jpe?g|gif|webp)$/i.test(msg.content)) ? (
                  <img
                    src={msg.content}
                    alt="uploaded"
                    className="max-w-xs max-h-48 rounded-md border object-cover"
                  />
                ) : (
                  <p>{msg.content}</p>
                )}
                <p className="text-xs opacity-75">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 items-center">
        <input
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 rounded border"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="text-sm"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessagePage;