import React, { useState } from 'react';
import MessageBox from '../../components/message/MessageBox'; // Adjust path if necessary

const BookingDetails = ({ booking }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div>
            {/* ... other booking details ... */}

            <button onClick={() => setIsChatOpen(!isChatOpen)}>
                {isChatOpen ? 'Close Chat' : 'Open Chat'}
            </button>

            {isChatOpen && (
                <div className="chat-popup">
                    <MessageBox bookingId={booking._id} />
                </div>
            )}
            
            {/* ... maybe some styling for chat-popup ... */}
            <style>{`
                .chat-popup {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 400px; /* Or your desired width */
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    background-color: white;
                    z-index: 1000;
                }
            `}</style>
        </div>
    );
};

export default BookingDetails;