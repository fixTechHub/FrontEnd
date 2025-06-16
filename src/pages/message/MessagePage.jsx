import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchBookingThunk } from '../features/bookings/bookingSlice';
import { fetchMessagesThunk, addMessage } from '../features/messages/messageSlice';
import { sendMessage, onReceiveMessage } from '../../services/socket';

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
        const toUserId = userRole === 'TECHNICIAN' ? booking.customerId : booking.technicianId;

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
        <div className="chat-cont-right">
            {/* Chat Header */}
            <div className="chat-header">
                <a id="back_user_list" href="javascript:void(0)" className="back-user-list">
                    <i className="feather-chevron-left"></i>
                </a>
                <div className="notify-block d-flex">
                    <div className="media-img-wrap flex-shrink-0">
                        <div className="avatar avatar-online">
                            <img src={user?.avatar || "/assets/img/profiles/default-avatar.jpg"} alt="User Image" className="avatar-img rounded-circle" />
                        </div>
                    </div>

                </div>
                <div className="chat-options">
                    <a href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#voice_call">
                        <i className="feather-phone"></i>
                    </a>
                    <a href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#video_call">
                        <i className="feather-video"></i>
                    </a>
                    <a href="javascript:void(0)">
                        <i className="feather-more-vertical"></i>
                    </a>
                </div>
            </div>

            {/* Chat Body */}
            <div className="chat-body">
                <div className="chat-scroll">
                    <ul className="list-unstyled">
                        {[...messages]
                            .sort((a, b) => {
                                const dateA = new Date(a.createdAt).setHours(0, 0, 0, 0);
                                const dateB = new Date(b.createdAt).setHours(0, 0, 0, 0);
                                return dateA - dateB;
                            })
                            .map((msg, index) => {
                                const isSent = msg.fromUser === user._id;
                                const messageDate = new Date(msg.createdAt);
                                const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <li key={msg._id || `${msg.fromUser}-${msg.createdAt}-${index}`}
                                        className={`notify-block ${isSent ? 'sent' : 'received'} d-flex`}>
                                        {!isSent && (
                                            <div className="avatar flex-shrink-0">
                                                <img src={user?.avatar || "/assets/img/profiles/default-avatar.jpg"}
                                                    alt="User Image"
                                                    className="avatar-img rounded-circle" />
                                            </div>
                                        )}
                                        <div className="media-body flex-grow-1">
                                            <div className="msg-box">
                                                <div>
                                                    {msg.content && (msg.content.startsWith('data:image') || /\.(png|jpe?g|gif|webp)$/i.test(msg.content)) ? (
                                                        <div className="chat-msg-attachments">
                                                            <div className="chat-attachment">
                                                                <img src={msg.content} alt="Attachment" />
                                                                <a href={msg.content} className="chat-attach-download" download>
                                                                    <i className="fas fa-download"></i>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p>{msg.content}</p>
                                                    )}
                                                    <ul className="chat-msg-info">
                                                        <li>
                                                            <div className="chat-time">
                                                                <span>{timeString}</span>
                                                            </div>
                                                        </li>
                                                        <li><a href="javascript:void(0)">Edit</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                    </ul>
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Chat Footer */}
            <div className="chat-footer">
                <form onSubmit={handleSendMessage}>
                    <div className="input-group">
                        <div className="btn-file btn">
                            <i className="fa fa-paperclip"></i>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                        </div>
                        <input
                            type="text"
                            className="input-msg-send form-control rounded-pill"
                            placeholder="Type something"
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                        />
                        <button type="submit" className="btn msg-send-btn rounded-pill ms-2">
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MessagePage;