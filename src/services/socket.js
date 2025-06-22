import { io } from 'socket.io-client';

const rawUrl = import.meta.env.VITE_API_BASE_URL;
const SOCKET_URL = rawUrl ? rawUrl.replace('/api', '') : '';
console.log('SOCKET_URL:', SOCKET_URL);

let socket = null;

export const initializeSocket = (userId) => {
  if (!userId) {
    console.warn('No userId provided for socket initialization');
    return;
  }

  // If a socket instance exists and is connected, do nothing.
  if (socket?.connected) {
    console.log(`Socket already connected: ${socket.id}`);
    return;
  }
  
  // If a socket instance exists but is disconnected, disconnect it fully
  // to ensure a clean slate before creating a new one.
  if (socket) {
    socket.disconnect();
  }

  console.log(`Initializing new socket for user: ${userId}`);
  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket'],
    reconnection: false, // Turn off auto-reconnect to manage it manually
    query: { userId },
  });

  socket.on('connect', () => {
    console.log(`Socket connected: ${socket.id}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${reason}`);
    // Nullify the socket instance on disconnect to allow re-initialization.
    socket = null;
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
};

export const sendMessage = (message) => {
  if (socket && socket.connected) {
    socket.emit('sendMessage', message);
  } else {
    console.error('Socket not connected when sending message');
  }
};

export const onReceiveMessage = (callback) => {
  if (socket) {
    const listener = (message) => {
      console.log('Received message:', message);
      callback(message);
    };
    socket.on('receiveMessage', listener);
    return () => {
      if (socket) socket.off('receiveMessage', listener);
      console.log('Removed receiveMessage listener');
    };
  }
};

export const onReceiveNotification = (callback) => {
  if (socket) {
    const listener = (notification) => {
      console.log('Received notification:', notification);
      callback(notification);
    };
    socket.on('receiveNotification', listener);
    return () => {
      if (socket) socket.off('receiveNotification', listener);
      console.log('Removed receiveNotification listener');
    };
  }
};

export const onNewRequest = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received new request:', data);
      callback(data);
    };
    socket.on('new_request', listener);
    return () => {
      if (socket) socket.off('new_request', listener);
      console.log('Removed new_request listener');
    };
  }
};

export const onNewBooking = (callback) => {
  if (socket) {
    const listener = (booking) => {
      console.log('Received new booking:', booking);
      callback(booking);
    };
    socket.on('new_booking', listener);
    return () => {
      if (socket) socket.off('new_booking', listener);
      console.log('Removed new_booking listener');
    };
  }
};

export const onNotificationUpdated = (callback) => {
  if (socket) {
    const listener = (notification) => {
      console.log('Notification updated:', notification);
      callback(notification);
    };
    socket.on('notificationUpdated', listener);
    return () => {
      if (socket) socket.off('notificationUpdated', listener);
      console.log('Removed notificationUpdated listener');
    };
  }
};

export const markNotificationRead = (notificationId) => {
  if (socket && socket.connected) {
    socket.emit('markNotificationRead', notificationId);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    // The disconnect handler will nullify the socket.
  }
};

export const requestUserNotifications = () => {
  if (socket && socket.connected) {
    socket.emit('requestUserNotifications');
  } else {
    console.error('Socket not connected when requesting notifications');
  }
};

export const onUserNotifications = (callback) => {
  if (socket) {
    const listener = (notifications) => {
      console.log('Received initial notifications:', notifications);
      callback(notifications);
    };
    socket.on('userNotifications', listener);
    return () => {
      if (socket) socket.off('userNotifications', listener);
      console.log('Removed userNotifications listener');
    };
  }
};

// Video Call Socket Functions
export const joinCallRoom = (callId) => {
  if (socket && socket.connected) {
    socket.emit('join_call_room', { callId });
  }
};

export const leaveCallRoom = (callId) => {
  if (socket && socket.connected) {
    socket.emit('leave_call_room', { callId });
  }
};

export const sendOffer = (callId, offer, targetUserId) => {
  if (socket && socket.connected) {
    socket.emit('offer', { callId, offer, targetUserId });
  }
};

export const sendAnswer = (callId, answer, targetUserId) => {
  if (socket && socket.connected) {
    socket.emit('answer', { callId, answer, targetUserId });
  }
};

export const sendIceCandidate = (callId, candidate, targetUserId) => {
  if (socket && socket.connected) {
    socket.emit('ice_candidate', { callId, candidate, targetUserId });
  }
};

// Video Call Event Listeners
export const onIncomingCall = (callback) => {
  if (socket) {
    const listener = (callData) => {
      console.log('Received incoming call:', callData);
      callback(callData);
    };
    socket.on('incoming_call', listener);
    return () => {
      if (socket) socket.off('incoming_call', listener);
      console.log('Removed incoming_call listener');
    };
  }
};

export const onCallAccepted = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Call accepted:', data);
      callback(data);
    };
    socket.on('call_accepted', listener);
    return () => {
      if (socket) socket.off('call_accepted', listener);
      console.log('Removed call_accepted listener');
    };
  }
};

export const onCallRejected = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Call rejected:', data);
      callback(data);
    };
    socket.on('call_rejected', listener);
    return () => {
      if (socket) socket.off('call_rejected', listener);
      console.log('Removed call_rejected listener');
    };
  }
};

export const onCallEnded = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Call ended:', data);
      callback(data);
    };
    socket.on('call_ended', listener);
    return () => {
      if (socket) socket.off('call_ended', listener);
      console.log('Removed call_ended listener');
    };
  }
};

export const onOffer = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received offer:', data);
      callback(data);
    };
    socket.on('offer', listener);
    return () => {
      if (socket) socket.off('offer', listener);
      console.log('Removed offer listener');
    };
  }
};

export const onAnswer = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received answer:', data);
      callback(data);
    };
    socket.on('answer', listener);
    return () => {
      if (socket) socket.off('answer', listener);
      console.log('Removed answer listener');
    };
  }
};

export const onIceCandidate = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received ICE candidate:', data);
      callback(data);
    };
    socket.on('ice_candidate', listener);
    return () => {
      if (socket) socket.off('ice_candidate', listener);
      console.log('Removed ice_candidate listener');
    };
  }
};