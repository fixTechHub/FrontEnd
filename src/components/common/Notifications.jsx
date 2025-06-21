import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  onReceiveNotification,
  onNotificationUpdated,
} from '../../services/socket';
import {
  fetchNotificationsThunk,
  markNotificationAsReadThunk,
  addNotification,
  updateNotification,
} from '../../features/notifications/notificationSlice';

const Notifications = ({ userId }) => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotificationsThunk());
    }

    const cleanupReceive = onReceiveNotification((notification) => {
      dispatch(addNotification(notification));
    });

    const cleanupUpdated = onNotificationUpdated((updatedNotification) => {
      dispatch(updateNotification(updatedNotification));
    });

    return () => {
      if (cleanupReceive) cleanupReceive();
      if (cleanupUpdated) cleanupUpdated();
    };
  }, [dispatch, userId]);

  const handleMarkNotificationRead = (notificationId) => {
    dispatch(markNotificationAsReadThunk(notificationId));
  };

  const handleClearAll = () => {
    notifications.forEach((notification) => {
      if (!notification.isRead) {
        handleMarkNotificationRead(notification._id);
      }
    });
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' mins ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <li className="nav-item dropdown logged-item noti-nav noti-wrapper">
      <a
        href="#"
        className="dropdown-toggle nav-link"
        onClick={() => setIsOpen(!isOpen)}
        data-bs-toggle="dropdown"
      >
        <span className="bell-icon">
          <img src="/img/icons/bell-icon.svg" alt="Bell" />
        </span>
        {unreadCount > 0 && (
          <span className="badge badge-pill">{unreadCount}</span>
        )}
      </a>

      {isOpen && (
        <div className="dropdown-menu notifications show">
          <div className="topnav-dropdown-header">
            <span className="notification-title">Notifications</span>
            <a
              href="#"
              className="clear-noti"
              onClick={(e) => {
                e.preventDefault();
                handleClearAll();
              }}
            >
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
                notifications.map((notification) => (
                  <li key={notification._id} className="notification-message">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleMarkNotificationRead(notification._id);
                      }}
                    >
                      <div className="media d-flex">
                        <span className="avatar avatar-lg flex-shrink-0">
                          <img
                            className="avatar-img rounded-circle"
                            alt="User Image"
                            src={
                              notification.userAvatar ||
                              '/img/profiles/avatar-01.jpg'
                            }
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">
                              {notification.title}
                            </span>
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