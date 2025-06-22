import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearIncomingCall } from '../../features/video-call/videoCallSlice';
import useVideoCall from '../../hooks/useVideoCall';
import { FaPhone, FaPhoneSlash, FaVideo } from 'react-icons/fa';

const IncomingCallModal = () => {
  const dispatch = useDispatch();
  const { isIncomingCall, incomingCallData } = useSelector((state) => state.videoCall);
  const { acceptCall, rejectCall } = useVideoCall();

  if (!isIncomingCall || !incomingCallData) {
    return null;
  }

  const handleAccept = async () => {
    try {
      await acceptCall();
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectCall();
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Caller Avatar */}
          <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FaVideo className="text-white text-2xl" />
          </div>
          
          {/* Caller Name */}
          <h3 className="text-xl font-semibold mb-2">
            Incoming Video Call
          </h3>
          
          <p className="text-gray-600 mb-6">
            {incomingCallData.callerName || `User ${incomingCallData.callerId}`} is calling...
          </p>
          
          {/* Call Actions */}
          <div className="flex justify-center space-x-4">
            {/* Accept Button */}
            <button
              onClick={handleAccept}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
            >
              <FaPhone className="text-white text-xl" />
            </button>
            
            {/* Reject Button */}
            <button
              onClick={handleReject}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
            >
              <FaPhoneSlash className="text-white text-xl" />
            </button>
          </div>
          
          {/* Call Info */}
          <div className="mt-4 text-sm text-gray-500">
            <p>Call ID: {incomingCallData.callId}</p>
            {incomingCallData.bookingId && (
              <p>Booking ID: {incomingCallData.bookingId}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal; 