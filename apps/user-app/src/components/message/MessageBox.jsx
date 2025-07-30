import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMessage, sendMessageThunk, fetchMessagesThunk } from '../../features/messages/messageSlice';
import { fetchBookingById } from '../../features/bookings/bookingSlice';
import { setCallEnded, setCurrentSessionId, declineCall } from '../../features/video-call/videoCallSlice';
import { onReceiveMessage, getSocket, initializeSocket } from '../../services/socket';
import { getWarrantyInformationThunk } from '../../features/booking-warranty/warrantySlice';
import './MessageBox.css'; // Import custom styles
const MessageBox = ({ bookingId, bookingWarrantyId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { booking, loading: bookingLoading, error: bookingError } = useSelector((state) => state.booking);
    const { messages, loading: messagesLoading, error: messagesError, sending } = useSelector((state) => state.messages);
    const { warranty, loading: warrantyLoading } = useSelector((state) => state.warranty);
    const [messageContent, setMessageContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const messagesEndRef = useRef(null);
    const { callEnded } = useSelector((state) => state.videoCall);
    const [incomingCall, setIncomingCall] = useState(null); // { from, name, signal, sessionId }
    const [filePreview, setFilePreview] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // already present
    const otherParticipant = bookingWarrantyId && warranty
        ? user?.role?.name === 'TECHNICIAN'
            ? warranty?.customerId
            : warranty?.technicianId?.userId
        : booking
            ? user?.role?.name === 'TECHNICIAN'
                ? booking?.customerId
                : booking?.technicianId?.userId
            : null;

    // useEffect(() => {
    //     if (bookingId) {
    //         dispatch(fetchBookingById(bookingId));
    //         dispatch(fetchMessagesThunk(bookingId));
    //     }
    // }, [dispatch, bookingId]);
    useEffect(() => {
        const idToUse = bookingId || bookingWarrantyId;
        if (!idToUse) return;

        if (bookingId) {
            dispatch(fetchBookingById(bookingId));
            dispatch(fetchMessagesThunk({ bookingId, bookingWarrantyId }));
        } else if (bookingWarrantyId) {
            dispatch(getWarrantyInformationThunk(bookingWarrantyId)); // Fetch warranty data
            dispatch(fetchMessagesThunk({ bookingId, bookingWarrantyId }));
        }
    }, [dispatch, bookingId, bookingWarrantyId]);

    // useEffect(() => {
    //     if (!bookingId) return;

    //     const cleanup = onReceiveMessage((newMessage) => {
    //         if (newMessage.bookingId.toString() === bookingId) {
    //             dispatch(addMessage(newMessage));
    //         }
    //     });

    //     return () => {
    //         if (cleanup) cleanup();
    //     };
    // }, [dispatch, bookingId]);
    useEffect(() => {
        const idToUse = bookingId || bookingWarrantyId;
        // if (!idToUse) return;

        // const cleanup = onReceiveMessage((newMessage) => {
        //     if ((newMessage.bookingId && newMessage.bookingId.toString() === bookingId) ||
        //         (newMessage.bookingWarrantyId && newMessage.bookingWarrantyId.toString() === bookingWarrantyId)) {
        //         dispatch(addMessage(newMessage));
        //     }
        // });

        // return () => {
        //     if (cleanup) cleanup();
        // };
        if (!idToUse || !user?._id) return;

        initializeSocket(user._id);

        const socket = getSocket();
        if (!socket) return;

       

           const cleanup = onReceiveMessage({
            socket,
            userId: user._id,
            bookingId,
            bookingWarrantyId,
            callback: (newMessage) => {
                console.log('Message received in MessageBox:', newMessage);
                if ((newMessage.bookingId && newMessage.bookingId.toString() === bookingId) ||
                    (newMessage.bookingWarrantyId && newMessage.bookingWarrantyId.toString() === bookingWarrantyId)) {
                    dispatch(addMessage(newMessage));
                }
            },
        });
        return () => {
            if (cleanup) cleanup();
        };
    }, [dispatch, bookingId, bookingWarrantyId]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handler = ({ from, name, signal, sessionId, bookingId, warrantyId }) => {
            console.log('Received callUser event in MessageBox:', { from, name, signal, sessionId,bookingId, warrantyId });
            const isValidCall = (bookingId && bookingId === bookingId) || (warrantyId && warrantyId === bookingWarrantyId);
            if (isValidCall && !incomingCall) { // Only set if no current incoming call
                setIncomingCall({ from, name, signal, sessionId });
            }
        };

        socket.on('callUser', handler);
        return () => socket.off('callUser', handler);
    }, [incomingCall]); // Depend on incomingCall to avoid overwriting during answer
   
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (callEnded) {
            dispatch(setCallEnded(false));
        }
    }, [callEnded, dispatch]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!messageContent.trim() && !selectedFile) || !user || (!booking && !warranty)) return;

        // const toUserId = user._id === booking.customerId._id
        //     ? booking.technicianId.userId._id
        //     : booking.customerId._id;
        const toUserId = bookingWarrantyId && warranty
            ? user._id === warranty.customerId._id
                ? warranty.technicianId.userId._id
                : warranty.customerId._id
            : booking
                ? user._id === booking.customerId._id
                    ? booking.technicianId.userId._id
                    : booking.customerId._id
                : null;
        if (!toUserId) return;
        const messageData = {
            bookingId,
            bookingWarrantyId: bookingWarrantyId || null,
            fromUser: user._id,
            toUser: toUserId,
            type: 'SERVICE',
            url: bookingWarrantyId
                ? `/warranty?bookingWarrantyId=${bookingWarrantyId}`
                : `/booking/booking-processing?bookingId=${bookingId}`,
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
            setFilePreview(null);
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

    const handleAnswer = () => {
        // Store the sessionId in Redux state for the video call page
        if (incomingCall.sessionId) {
            dispatch(setCurrentSessionId(incomingCall.sessionId));
        }
        navigate(`/video-call/${bookingId}`,
            {
                state:
                {
                    answerCall: true,
                    incomingCall,
                    bookingWarrantyId,
                    fromMessageBox: true
                }
            });
        setIncomingCall(null); // Clear after navigation
    };

    const handleVideoCallButtonClick = () => {
        navigate(`/video-call/${bookingId}`, {
            state: {
                bookingWarrantyId,
                fromMessageBox: true, // Add flag to indicate navigation from MessageBox
            },
        });
    };

    const handleDecline = async () => {
        if (incomingCall) {
            console.log(`Declining call from ${incomingCall.from}`);
            try {
                // Use REST API to decline call
                await dispatch(declineCall({
                    sessionId: incomingCall.sessionId,
                    to: incomingCall.from
                })).unwrap();

                console.log('Call declined successfully');
            } catch (error) {
                console.error('Failed to decline call:', error);
            }
        }
        setIncomingCall(null); // Clear incoming call state
    };

    if (!bookingId) return null;
    if (bookingLoading === 'pending' || messagesLoading === 'pending') return <div className="message-loading">Loading...</div>;
    if (bookingError) return <div className="message-error">Error: {bookingError}</div>;
    if (messagesError) return <div className="message-error">Error: {messagesError}</div>;

    if (!booking || !booking.customerId?._id || !booking.technicianId?.userId?._id) {
        return <div className="message-incomplete">Booking data is incomplete or still loading.</div>;
    }

    return (
        <div className="message-box-container">
            {incomingCall && (
                <div className="incoming-call-overlay">
                    <div className="incoming-call-modal">
                        <div className="incoming-call-header">
                            <h3 className="incoming-call-title">{incomingCall.name} is calling...</h3>
                        </div>
                        <div className="incoming-call-actions">
                            <button className="btn btn-success btn-answer" onClick={handleAnswer}>
                                <i className="fas fa-phone"></i> Answer
                            </button>
                            <button className="btn btn-danger btn-decline" onClick={handleDecline}>
                                <i className="fas fa-phone-slash"></i> Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewImage && (
                <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
                    <div className="image-preview-container">
                        <button
                            className="image-preview-close"
                            onClick={() => setPreviewImage(null)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="image-preview"
                        />
                    </div>
                </div>
            )}

            <div className="modern-chat-container">
                <div className="chat-header-modern">
                    <div className="chat-participant-info">
                        <div className="participant-avatar-wrapper">
                            <div className="participant-avatar online">
                                {otherParticipant?.avatar ? (
                                    <img
                                        src={otherParticipant.avatar}
                                        alt="User Image"
                                        className="avatar-image"
                                    />
                                ) : (
                                    <div className="avatar-placeholder">

                                    </div>
                                )}
                                <div className="online-indicator"></div>
                            </div>
                        </div>
                        <div className="participant-details">
                            <div className="participant-name">{otherParticipant?.fullName}</div>
                            <div className="participant-status">Online</div>
                        </div>
                    </div>
                    <div className="chat-actions">
                        <button
                            className="video-call-btn"
                            // onClick={() => navigate(`/video-call/${bookingId}`, { state: { bookingWarrantyId } })}
                            onClick={handleVideoCallButtonClick}
                            title="Start video call"
                        >
                            <i className="fas fa-video"></i>
                        </button>
                    </div>
                </div>

                <div className="chat-messages-container">
                    <div className="chat-messages-scroll">
                        <div className="messages-list">
                            {[...messages]
                                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                .map((msg) => {
                                    const isSent = msg.fromUser === user._id;
                                    const messageDate = new Date(msg.createdAt);
                                    const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <div key={msg._id} className={`message-item ${isSent ? 'sent' : 'received'}`}>
                                            {!isSent && (
                                                <div className="message-avatar">
                                                    <img
                                                        src={otherParticipant?.avatar || "/assets/img/profiles/default-avatar.jpg"}
                                                        alt="User Image"
                                                        className="message-avatar-img"
                                                    />
                                                </div>
                                            )}
                                            <div className="message-content-wrapper">
                                                <div className="message-bubble">
                                                    {msg.content && (msg.content.startsWith('data:image') || /\.(png|jpe?g|gif|webp)$/i.test(msg.content)) ? (
                                                        <div className="message-image-container">
                                                            <div
                                                                className="message-image"
                                                                onClick={() => setPreviewImage(msg.content)}
                                                            >
                                                                <img
                                                                    src={msg.content}
                                                                    alt="Attachment"
                                                                    className="message-img"
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="message-text">{msg.content}</div>
                                                    )}
                                                    <div className="message-time">{timeString}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="chat-input-container">
                    {filePreview && (
                        <div className="file-preview-container">
                            <div className="file-preview-wrapper">
                                <img
                                    src={filePreview}
                                    alt="Preview"
                                    className="file-preview-image"
                                />
                                <button
                                    type="button"
                                    className="file-preview-remove"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setFilePreview(null);
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="message-form">
                        <div className="message-input-group">
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="file-input"
                                    className="file-input"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        setSelectedFile(file);
                                        if (file) {
                                            const previewUrl = URL.createObjectURL(file);
                                            setFilePreview(previewUrl);
                                        }
                                    }}
                                />
                                <label htmlFor="file-input" className="file-input-btn">
                                    <i className="fas fa-paperclip"></i>
                                </label>
                            </div>

                            <input
                                type="text"
                                className="message-input"
                                placeholder="Type your message..."
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                disabled={sending === 'pending'}
                            />

                            <button
                                type="submit"
                                className="send-btn"
                                disabled={sending === 'pending'}
                            >
                                {sending === 'pending' ? (
                                    <div className="sending-spinner"></div>
                                ) : (
                                    <i className="fas fa-paper-plane"></i>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MessageBox;