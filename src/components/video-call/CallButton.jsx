import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useVideoCall from '../../hooks/useVideoCall';
import { FaVideo, FaSpinner } from 'react-icons/fa';
import { setCaller } from '../../features/video-call/videoCallSlice';

const CallButton = ({ 
  calleeId, 
  calleeName, 
  bookingId, 
  className = '', 
  size = 'md',
  disabled = false,
  style = {}
}) => {
  const [isInitiating, setIsInitiating] = useState(false);
  const dispatch = useDispatch();
  const { initiateCall } = useVideoCall();
  const { callStatus } = useSelector((state) => state.videoCall);
  const { user } = useSelector((state) => state.auth);

  const handleInitiateCall = async () => {
    if (disabled || isInitiating || callStatus !== 'idle' || !user) {
      return;
    }

    setIsInitiating(true);
    try {
      const callerData = { _id: user._id, name: user.fullName };
      dispatch(setCaller(callerData));
      await initiateCall(callerData, calleeId, calleeName, bookingId);
    } catch (error) {
      console.error('Error initiating call:', error);
    } finally {
      setIsInitiating(false);
    }
  };

  // Size classes - only apply if no custom style is provided
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const iconSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Use custom style if provided, otherwise use size classes
  const buttonStyle = Object.keys(style).length > 0 ? style : {};
  const sizeClass = Object.keys(style).length > 0 ? '' : sizeClasses[size];
  const iconSizeClass = Object.keys(style).length > 0 ? '' : iconSizeClasses[size];

  return (
    <button
      onClick={handleInitiateCall}
      disabled={disabled || isInitiating || callStatus !== 'idle'}
      className={`
        ${sizeClass}
        ${className}
        bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400
        text-white rounded-full flex items-center justify-center
        transition-colors duration-200
        ${Object.keys(style).length > 0 ? '' : 'border-0'}
      `}
      style={buttonStyle}
      title={`Call ${calleeName || 'User'}`}
    >
      {isInitiating ? (
        <FaSpinner className={`${iconSizeClass} animate-spin`} />
      ) : (
        <FaVideo className={iconSizeClass} />
      )}
    </button>
  );
};

export default CallButton; 