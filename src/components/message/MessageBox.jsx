import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, sendMessageThunk, fetchMessagesThunk } from '../../features/messages/messageSlice';
import { fetchBookingById } from '../../features/bookings/bookingSlice';
import { onReceiveMessage } from '../../services/socket';

const MessageBox = ({ bookingId }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { booking, loading: bookingLoading, error: bookingError } = useSelector((state) => state.booking);
    const { messages, loading: messagesLoading, error: messagesError, sending } = useSelector((state) => state.messages);
    const [messageContent, setMessageContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const messagesEndRef = useRef(null);

    const otherParticipant = user?.role?.name === 'TECHNICIAN'
        ? booking?.customerId
        : booking?.technicianId?.userId;

    // Effect for fetching data when the bookingId changes
    useEffect(() => {
        if (bookingId) {
            dispatch(fetchBookingById(bookingId));
            dispatch(fetchMessagesThunk(bookingId));
        }
    }, [dispatch, bookingId]);

    // Effect for setting up the real-time message listener
    useEffect(() => {
        if (!bookingId) return;

        const cleanup = onReceiveMessage((newMessage) => {
            if (newMessage.bookingId.toString() === bookingId) {
                dispatch(addMessage(newMessage));
            }
        });

        return () => {
            if (cleanup) cleanup();
        };
    }, [dispatch, bookingId]);

    // Effect for scrolling to the bottom when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!messageContent.trim() && !selectedFile) || !user || !booking) return;

        const toUserId = user._id === booking.customerId._id
            ? booking.technicianId.userId._id
            : booking.customerId._id;

        const messageData = {
            bookingId,
            fromUser: user._id,
            toUser: toUserId,
            type: 'SERVICE',
        };

        if (selectedFile) {
            const base64 = await convertFileToBase64(selectedFile);
            messageData.fileBase64 = base64;
            messageData.originalName = selectedFile.name;
            messageData.mimetype = selectedFile.type;
        } else {
            messageData.content = messageContent;
        }

        dispatch(sendMessageThunk(messageData)).then(() => {
            setMessageContent('');
            setSelectedFile(null);
        });
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    if (!bookingId) return null; // Don't render if there's no bookingId
    if (bookingLoading === 'pending' || messagesLoading === 'pending') return <div>Loading...</div>;
    if (bookingError) return <div>Error: {bookingError}</div>;
    if (messagesError) return <div>Error: {messagesError}</div>;

    // Add a more robust check to ensure nested data is present
    if (!booking || !booking.customerId?._id || !booking.technicianId?.userId?._id) {
        return <div>Booking data is incomplete or still loading.</div>;
    }

    return (
        <div className="card" style={{ height: '85vh', display: 'flex', flexDirection: 'column', width: '100%', }}>
            <div className="chat-window" style={{ flexGrow: 1, display: 'flex', width: '100%', }}>
                <div className="chat-cont-right" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%'  }}>
                    {/* Chat Header */}
                    <div className="chat-header">
                        <div className="notify-block d-flex">
                            <div className="media-img-wrap flex-shrink-0">
                                <div className="avatar avatar-online">
                                    <img src={otherParticipant?.avatar || "/assets/img/profiles/default-avatar.jpg"} alt="User Image" className="avatar-img rounded-circle" />
                                </div>
                            </div>
                            <div className="media-body flex-grow-1">
                                <div className="user-name">{otherParticipant?.fullName}</div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Body */}

                    <div className="chat-body" style={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                        <div className="chat-scroll">
                            <ul className="list-unstyled">
                                {[...messages]
                                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                    .map((msg) => {
                                        const isSent = msg.fromUser === user._id;
                                        const messageDate = new Date(msg.createdAt);
                                        const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <li key={msg._id}
                                                className={`notify-block ${isSent ? 'sent' : 'received'} d-flex`}>
                                                {!isSent && (
                                                    <div className="avatar flex-shrink-0">
                                                        <img src={otherParticipant?.avatar || "/assets/img/profiles/default-avatar.jpg"}
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
                                    disabled={sending === 'pending'}
                                />
                                <button type="submit" className="btn msg-send-btn rounded-pill ms-2" disabled={sending === 'pending'}>
                                    {sending === 'pending' ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <i className="fa-solid fa-paper-plane"></i>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBox; 