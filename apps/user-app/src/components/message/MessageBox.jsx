import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMessage, sendMessageThunk, fetchMessagesThunk } from '../../features/messages/messageSlice';
import { fetchBookingById } from '../../features/bookings/bookingSlice';
import { setCallEnded, setCurrentSessionId, declineCall } from '../../features/video-call/videoCallSlice';
import { onReceiveMessage, getSocket } from '../../services/socket';

const MessageBox = ({ bookingId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { booking, loading: bookingLoading, error: bookingError } = useSelector((state) => state.booking);
    const { messages, loading: messagesLoading, error: messagesError, sending } = useSelector((state) => state.messages);
    const [messageContent, setMessageContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const messagesEndRef = useRef(null);
    const { callEnded } = useSelector((state) => state.videoCall);
    const [incomingCall, setIncomingCall] = useState(null); // { from, name, signal, sessionId }
    const [filePreview, setFilePreview] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // already present

    const otherParticipant = user?.role?.name === 'TECHNICIAN'
        ? booking?.customerId
        : booking?.technicianId?.userId;

    useEffect(() => {
        if (bookingId) {
            dispatch(fetchBookingById(bookingId));
            dispatch(fetchMessagesThunk(bookingId));
        }
    }, [dispatch, bookingId]);

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

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handler = ({ from, name, signal, sessionId }) => {
            console.log('Received callUser event in MessageBox:', { from, name, signal, sessionId });
            if (!incomingCall) { // Only set if no current incoming call
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
        navigate(`/video-call/${bookingId}`, { state: { answerCall: true, incomingCall } });
        setIncomingCall(null); // Clear after navigation
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
    if (bookingLoading === 'pending' || messagesLoading === 'pending') return <div>Loading...</div>;
    if (bookingError) return <div>Error: {bookingError}</div>;
    if (messagesError) return <div>Error: {messagesError}</div>;

    if (!booking || !booking.customerId?._id || !booking.technicianId?.userId?._id) {
        return <div>Booking data is incomplete or still loading.</div>;
    }

    return (
        <div className="card">
            {incomingCall && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 320, textAlign: 'center' }}>
                        <h3>{incomingCall.name} is calling...</h3>
                        <div style={{ marginTop: 24 }}>
                            <button className="btn btn-success me-2" onClick={handleAnswer}>Answer</button>
                            <button className="btn btn-danger" onClick={handleDecline}>Decline</button>
                        </div>
                    </div>
                </div>
            )}
            {previewImage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                    }}
                    onClick={() => setPreviewImage(null)}
                >
                    <img
                        src={previewImage}
                        alt="Preview"
                        style={{
                            maxHeight: '90%',
                            maxWidth: '90%',
                            borderRadius: 8,
                            boxShadow: '0 0 10px rgba(255,255,255,0.2)',
                        }}
                    />
                </div>
            )}
            <div className="chat-window">
                <div className="chat-cont-right">
                    <div className="chat-header">
                        <div className="notify-block d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="media-img-wrap flex-shrink-0">
                                    <div className="avatar avatar-online">
                                        <img src={otherParticipant?.avatar || "/assets/img/profiles/default-avatar.jpg"} alt="User Image" className="avatar-img rounded-circle" />
                                    </div>
                                </div>
                                <div className="media-body flex-grow-1 ms-3">
                                    <div className="user-name">{otherParticipant?.fullName}</div>
                                    <div className="user-status text-muted small">Online</div>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/video-call/${bookingId}`)}
                                >
                                    <i className="fas fa-video"></i>
                                </button>
                            </div>
                        </div>
                    </div>
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
                                                                    <div
                                                                        className="chat-attachment"
                                                                        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                                                                        onClick={() => {
                                                                            setPreviewImage(msg.content);
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={msg.content}
                                                                            alt="Attachment"
                                                                            style={{ maxHeight: 150, borderRadius: 8, pointerEvents: 'auto' }}
                                                                        />
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
                    <div className="chat-footer">
                        <form onSubmit={handleSendMessage}>
                            <div className="input-group">
                                <div className="btn-file btn">
                                    <i className="fa fa-paperclip"></i>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        tabIndex={-1}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setSelectedFile(file);
                                            if (file) {
                                                const previewUrl = URL.createObjectURL(file);
                                                setFilePreview(previewUrl);
                                            }
                                        }}
                                    />
                                </div>
                                {filePreview && (
                                    <div className="mb-2">
                                        <img
                                            src={filePreview}
                                            alt="Preview"
                                            style={{ maxHeight: 150, borderRadius: 8 }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger mt-1"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setFilePreview(null);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
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