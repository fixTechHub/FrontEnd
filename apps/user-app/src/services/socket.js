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
  socket = io(
    SOCKET_URL
    // || '/'
    , {
      // path: '/socket.io',
      withCredentials: true,
      transports: ['websocket'],
      reconnection: true,
      // reconnectionAttempts: 5,     // Max attempts
      // reconnectionDelay: 1000,     // Start with 1s delay
      // reconnectionDelayMax: 5000,  // Cap the delay to 5s
      // timeout: 10000,              // Timeout for each connection attempt
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

// export const onReceiveMessage = (callback) => {
//   if (socket) {
//     const listener = (message) => {
//       console.log('Received message:', message);
//       callback(message);
//     };
//     socket.on('receiveMessage', listener);
//     // return () => {
//     //   if (socket) socket.off('receiveMessage', listener);
//     //   console.log('Removed receiveMessage listener');
//     // };
//     const room = socket.bookingWarrantyId
//             ? `warranty:${socket.bookingWarrantyId}:user:${socket.userId}`
//             : socket.bookingId
//                 ? `booking:${socket.bookingId}:user:${socket.userId}`
//                 : `user:${socket.userId}`;
//         socket.emit('joinChatRoom', room);

//         return () => {
//             if (socket) {
//                 socket.off('receiveMessage', listener);
//                 socket.emit('leaveRoom', room);
//                 console.log('Removed receiveMessage listener and left room:', room);
//             }
//         };
//   }
// };
export const onReceiveMessage = ({
  socket,
  userId,
  bookingId = null,
  bookingWarrantyId = null,
  callback,
}) => {
  if (socket && userId) {
    // 1️⃣ Prepare listener
    const listener = (message) => {
      console.log('Received message:', message);
      callback(message);
    };
    socket.on('receiveMessage', listener);

    // 2️⃣ Build room name
    const room = bookingWarrantyId
      ? `warranty:${bookingWarrantyId}:user:${userId}`
      : bookingId
        ? `booking:${bookingId}:user:${userId}`
        : `user:${userId}`; // fallback, but you probably won’t use this for messages

    // 3️⃣ Join room
    socket.emit('joinChatRoom', {
      type: bookingWarrantyId ? 'warranty' : 'booking',
      bookingId,
      warrantyId: bookingWarrantyId,
    });
    console.log('Joined room:', room);

    // 4️⃣ Cleanup
    return () => {
      socket.off('receiveMessage', listener);
      socket.emit('leaveRoom', { room });
      console.log('Removed listener & left room:', room);
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
      if (socket) socket?.off('receiveNotification', listener);
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
      if (socket) socket?.off('new_request', listener);
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
      if (socket) socket?.off('new_booking', listener);
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
      if (socket) socket?.off('notificationUpdated', listener);
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
      if (socket) socket?.off('userNotifications', listener);
      console.log('Removed userNotifications listener');
    };
  }
};

export const onNotificationsCleared = (callback) => {
  socket.on('notificationsCleared', callback);
  return () => socket?.off('notificationsCleared', callback);
};

export const onWarrantyUpdated = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received warranty update:', data);
      callback(data);
    };
    socket.on('warrantyUpdated', listener);
    return () => {
      if (socket) socket.off('warrantyUpdated', listener);
      console.log('Removed warrantyUpdated listener');
    };
  }
}
export const onBookingNew = (callback) => {
  if (socket) {
    const listener = (data) => callback(data);
    socket.on('booking:new', listener);
    return () => socket?.off('booking:new', listener);
  }

  return () => {};
};

export const onTechnicianResponse = (callback) => {
  if (socket) {
    const listener = (data) => callback(data);
    socket.on('booking:technicianResponse', listener);
    return () => socket?.off('booking:technicianResponse', listener);
  }

  return () => {};
};

export const onBookingQuotation = (callback) => {
  if (socket) {
    const listener = (data) => callback(data);
    socket.on('booking:quotation', listener);
    return () => socket?.off('booking:quotation', listener);
  }

  return () => {};
};

export const onUserQuotationResponse = (callback) => {
  if (socket) {
    const listener = (data) => callback(data);
    socket.on('booking:userQuotationResponse', listener);
    return () => socket?.off('booking:userQuotationResponse', listener);
  }

  return () => {};
};

export const onBookingAdditionalFee = (callback) => {
  if (socket) {
    const listener = (data) => callback(data);
    socket.on('booking:additionalFee', listener);
    return () => socket?.off('booking:additionalFee', listener);
  }

  return () => {};
};

export const onUserAdditionalFeeResponse = (callback) => {
  if (socket) {
    const listener = (data) => callback(data);
    socket.on('booking:userAdditionalFeeResponse', listener);
    return () => socket?.off('booking:userAdditionalFeeResponse', listener);
  }

  return () => {};
};

export const onBookingStatusUpdate = (callback) => {
  if (socket) {
    const listener = (data) => callback(data);
    socket.on('booking:statusUpdate', listener);
    return () => socket?.off('booking:statusUpdate', listener);
  }

  return () => {};
};

// Thêm các hàm socket mới cho booking request
export const onBookingRequestAccepted = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received booking request accepted:', data);
      callback(data);
    };
    socket.on('booking:requestAccepted', listener);
    return () => socket?.off('booking:requestAccepted', listener);
  }

  return () => {};
};

export const onBookingRequestRejected = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received booking request rejected:', data);
      callback(data);
    };
    socket.on('booking:requestRejected', listener);
    return () => socket?.off('booking:requestRejected', listener);
  }

  return () => {};
};

export const onBookingRequestStatusUpdate = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received booking request status update:', data);
      callback(data);
    };
    socket.on('booking:requestStatusUpdate', listener);
    return () => socket?.off('booking:requestStatusUpdate', listener);
  }

  return () => {};
};

// Cập nhật realtime danh sách thợ cho màn hình chọn thợ
export const onTechniciansFoundUpdated = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received technicians found updated:', data);
      callback(data);
    };
    socket.on('booking:techniciansFoundUpdated', listener);
    return () => socket?.off('booking:techniciansFoundUpdated', listener);
  }

  return () => {};
};

// Thêm các hàm socket mới cho thiết bị phát sinh
export const onAdditionalItemsAdded = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received additional items added:', data);
      callback(data);
    };
    socket.on('booking:additionalItemsAdded', listener);
    return () => socket?.off('booking:additionalItemsAdded', listener);
  }

  return () => {};
};

export const onAdditionalItemsStatusUpdate = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received additional items status update:', data);
      callback(data);
    };
    socket.on('booking:additionalItemsStatusUpdate', listener);
    return () => socket?.off('booking:additionalItemsStatusUpdate', listener);
  }

  return () => {};
};

export const onAdditionalItemsAccepted = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received additional items accepted:', data);
      callback(data);
    };
    socket.on('booking:additionalItemsAccepted', listener);
    return () => socket?.off('booking:additionalItemsAccepted', listener);
  }

  return () => {};
};

export const onAdditionalItemsRejected = (callback) => {
  if (socket) {
    const listener = (data) => {
      console.log('Received additional items rejected:', data);
      callback(data);
    };
    socket.on('booking:additionalItemsRejected', listener);
    return () => socket?.off('booking:additionalItemsRejected', listener);
  }

  return () => {};
};

export const getSocket = () => socket;