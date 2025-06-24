import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleVideo, toggleAudio, setError } from '../../features/video-call/videoCallSlice';
import useVideoCall from '../../hooks/useVideoCall';
import { 
  FaPhone, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash,
  FaTimes,
  FaExpand,
  FaCompress
} from 'react-icons/fa';

const VideoCall = () => {
  const dispatch = useDispatch();
  const {
    currentCall,
    callStatus,
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    caller: self,
    error
  } = useSelector((state) => state.videoCall);
  
  const { endCall } = useVideoCall();
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
    dispatch(toggleVideo());
  };

  const handleToggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
    dispatch(toggleAudio());
  };

  const handleEndCall = async () => {
    try {
      await endCall();
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  if (!currentCall || callStatus === 'idle') {
    return null;
  }
  
  const otherPersonName = self?._id === currentCall?.callerId
    ? currentCall?.calleeName
    : currentCall?.callerName;
  const otherPersonId = self?._id === currentCall?.callerId
    ? currentCall?.calleeId
    : currentCall?.callerId;


  return (
    <div className="fixed inset-0 bg-black z-40">
      {/* Error Display */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50">
          {error}
        </div>
      )}

      {/* Call Status */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg">
        {callStatus === 'ringing' && 'Ringing...'}
        {callStatus === 'connecting' && 'Connecting...'}
        {callStatus === 'connected' && 'Connected'}
        {callStatus === 'ended' && 'Call Ended'}
      </div>

      {/* Video Container */}
      <div className="relative w-full h-full">
        {/* Remote Video (Main) */}
        <video
          key={remoteStream ? remoteStream.id : 'remote'}
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700">
          <video
            key={localStream ? localStream.id : 'local'}
            ref={localVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            muted={true}
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <FaVideoSlash className="text-white text-2xl" />
            </div>
          )}
        </div>

        {/* Call Info */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          <p className="text-sm">
            Call with {otherPersonName || `User ${otherPersonId}`}
          </p>
          <p className="text-xs text-gray-300">
            Call ID: {currentCall.callId}
          </p>
        </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        {/* Audio Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isAudioEnabled 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isAudioEnabled ? (
            <FaMicrophone className="text-white text-lg" />
          ) : (
            <FaMicrophoneSlash className="text-white text-lg" />
          )}
        </button>

        {/* Video Toggle */}
        <button
          onClick={handleToggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isVideoEnabled 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isVideoEnabled ? (
            <FaVideo className="text-white text-lg" />
          ) : (
            <FaVideoSlash className="text-white text-lg" />
          )}
        </button>

        {/* End Call */}
        <button
          onClick={handleEndCall}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
        >
          <FaPhone className="text-white text-xl" />
        </button>
      </div>

      {/* Loading State */}
      {(callStatus === 'connecting' || callStatus === 'ringing') && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>{callStatus === 'ringing' ? 'Ringing...' : 'Connecting...'}</p>
          </div>
        </div>
      )}

      {/* Call Ended State */}
      {callStatus === 'ended' && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-white text-center">
            <FaTimes className="text-6xl mx-auto mb-4 text-red-500" />
            <p className="text-xl mb-4">Call Ended</p>
            <button
              onClick={handleEndCall}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall; 