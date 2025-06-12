import React, { useState, useEffect } from 'react';
import {
  onReceiveNotification,
  onNotificationUpdated,
  markNotificationRead,
} from '../../services/socket';

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

  const handleClearAll = () => {
    notifications.forEach(notification => {
      if (!notification.isRead) {
        handleMarkNotificationRead(notification._id);
      }
    });
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <li className="nav-item dropdown logged-item noti-nav noti-wrapper">
      <a href="#" className="dropdown-toggle nav-link" onClick={() => setIsOpen(!isOpen)}>
        <span className="bell-icon">
          <img src="/img/icons/bell-icon.svg" alt="Bell" />
        </span>
        {notifications.filter((n) => !n.isRead).length > 0 && (
          <span className="badge badge-pill">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
      </a>

      {isOpen && (
        <div className="dropdown-menu notifications">
          <div className="topnav-dropdown-header">
            <span className="notification-title">Notifications</span>
            <a href="javascript:void(0)" className="clear-noti" onClick={handleClearAll}>
              Clear All
            </a>
          </div>

          <div className="noti-content">
            <ul className="notification-list">
              {notifications.length === 0 ? (
                <li className="notification-message">
                  <div className="media d-flex">
                    <div className="media-body flex-grow-1">
                      <p className="noti-details">No notifications</p>
                    </div>
                  </div>
                </li>
              ) : (
                notifications
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((notification) => (
                    <li key={notification._id} className="notification-message">
                      <a href="#" onClick={() => handleMarkNotificationRead(notification._id)}>
                        <div className="media d-flex">
                          <span className="avatar avatar-lg flex-shrink-0">
                            <img 
                              className="avatar-img rounded-circle" 
                              alt="User Image" 
                              src={notification.userAvatar || "assets/img/profiles/avatar-default.jpg"}
                            />
                          </span>
                          <div className="media-body flex-grow-1">
                            <p className="noti-details">
                              <span className="noti-title">{notification.title}</span>
                              {notification.content}
                            </p>
                            <p className="noti-time">
                              <span className="notification-time">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </a>
                    </li>
                  ))
              )}
            </ul>
          </div>

          <div className="topnav-dropdown-footer">
            <a href="#">View all Notifications</a>
          </div>
        </div>
      )}
    </li>
  );
};

export default Notifications;