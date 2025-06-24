import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCaller } from '../../features/video-call/videoCallSlice';
import IncomingCallModal from './IncomingCallModal';
import VideoCall from './VideoCall';

const VideoCallProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Set the caller in the video call state when user is authenticated
  useEffect(() => {
    if (user) {
      dispatch(setCaller(user));
    }
  }, [user, dispatch]);

  return (
    <>
      {children}
      
      {/* Video Call Components */}
      <IncomingCallModal />
      <VideoCall />
    </>
  );
};

export default VideoCallProvider; 