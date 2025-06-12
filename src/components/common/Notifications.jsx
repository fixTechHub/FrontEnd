import React, { useState, useEffect } from 'react';
import {
  onReceiveNotification,
  onNotificationUpdated,
  markNotificationRead,
} from '../../services/';

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onReceiveNotification((notification) => {
      console.log('Received notification:', notification);
      setNotifications((prev) => [...prev, notification]);
    });

    onNotificationUpdated((updatedNotification) => {
      console.log('Notification updated:', updatedNotification);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === updatedNotification._id ? updatedNotification : n
        )
      );
    });
  }, []);

  const handleMarkNotificationRead = (notificationId) => {
    markNotificationRead(notificationId);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {notifications.filter((n) => !n.isRead).length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications</p>
            ) : (
              notifications
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-2 mb-2 rounded ${
                      notification.isRead ? 'bg-gray-100' : 'bg-yellow-50'
                    }`}
                  >
                    <h4 className="font-bold text-sm">{notification.title}</h4>
                    <p className="text-sm">{notification.content}</p>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkNotificationRead(notification._id)}
                        className="text-blue-500 text-xs mt-1"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;