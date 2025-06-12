import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
console.log('SOCKET_URL:', SOCKET_URL);

let socket = null;

export const initializeSocket = (userId) => {
  if (!userId) {
    console.warn('No userId provided for socket initialization');
    return null;
  }

  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: { userId },
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('joinUserRoom', userId);
      console.log('Joined room: user:', userId);
    });

    socket.on('reconnect', () => {
      console.log('Socket reconnected:', socket.id);
      socket.emit('joinUserRoom', userId);
      console.log('Rejoined room: user:', userId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  return socket;
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
      socket.off('receiveMessage', listener);
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
      socket.off('receiveNotification', listener);
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
      socket.off('new_request', listener);
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
      socket.off('new_booking', listener);
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
      socket.off('notificationUpdated', listener);
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
    socket = null;
    console.log('Socket disconnected manually');
  }
};