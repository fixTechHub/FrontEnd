import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  onReceiveNotification,
  onNotificationUpdated,
} from '../../services/socket';
import {
  fetchNotificationsThunk,
  markNotificationAsReadThunk,
  clearAllNotificationsThunk,
  fetchAllNotificationsThunk,
  addNotification,
  updateNotification,
  clearNotifications,
} from '../../features/notifications/notificationSlice';
import { useNavigate } from 'react-router-dom';

const styles = {
  notificationMessage: {
    padding: '10px 15px',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s',
    cursor: 'default',
  },
  clickableNotification: {
    cursor: 'pointer'
  },
  markAsReadBtn: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    color: '#6c757d',
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    marginLeft: '0.5rem',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#e9ecef',
      borderColor: '#dee2e6',
      color: '#495057',
    }
  },
  unreadNotification: {
    backgroundColor: '#f8f9fa'
  },
  bellIcon: {
    position: 'relative',
    display: 'flex',
    width: '36px',
    height: '36px',
    background: '#F1F1F1',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    minWidth: '24px',
    height: '24px',
    fontSize: '12px',
    fontWeight: 'bold',
    lineHeight: '24px',
    padding: '0 8px',
    borderRadius: '12px',
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#dc3545',
    color: 'white',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePillLarge: {
    minWidth: '28px',
    height: '28px',
    fontSize: '14px',
    lineHeight: '28px',
    borderRadius: '14px',
    top: '-10px',
    right: '-10px',
  }
};
const Notifications = ({ userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, status } = useSelector((state) => state.notifications);
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

  const handleNotificationClick = (notification) => {
    if (notification.url) {
      if (!notification.isRead) {
        dispatch(markNotificationAsReadThunk(notification._id));
      }
      const targetUrl = notification.url.startsWith('/')
        ? notification.url
        : `/${notification.url}`;
      try {
        navigate(targetUrl);
        setIsOpen(false);
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  };

  const handleMarkNotificationRead = (notificationId) => {
    dispatch(markNotificationAsReadThunk(notificationId));
  };

  const handleClearAll = () => {
    dispatch(clearAllNotificationsThunk()).then(() => {
      dispatch(clearNotifications());
    });
  };

  const handleViewAllNotifications = () => {
    dispatch(fetchAllNotificationsThunk({ limit: 50, skip: 0 }));
    navigate('/notifications/all');
    setIsOpen(false);
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

  const unreadCount = notifications.filter((n) => !n.isRead && n.status === 'DISPLAY').length;

  return (
    <div className="nav-item dropdown logged-item noti-nav noti-wrapper">
      <a
        href="#"
        className="dropdown-toggle nav-link"
        onClick={() => setIsOpen(!isOpen)}
      // data-bs-toggle="dropdown"
      >
        <span style={styles.bellIcon}>
          <img src="/img/icons/bell-icon.svg" alt="Bell" />
        </span>
        {unreadCount > 0 && (
          <span style={{ ...styles.badgePill, ...styles.badgePillLarge }}>{unreadCount}</span>
        )}
      </a>

      {isOpen && (
        <div className="dropdown-menu notifications show">
          <div className="topnav-dropdown-header">
            <span className="notification-title">Thông Báo</span>
            <a
              href="#"
              className="clear-noti"
              onClick={(e) => {
                e.preventDefault();
                handleClearAll();
              }}
            >
              Xóa tất cả
            </a>
          </div>
          <div className="noti-content">
            <ul className="notification-list">
              {status === 'loading' ? (
                <li className="notification-message">
                  <div className="media d-flex">
                    <div className="media-body flex-grow-1">
                      <p className="noti-details">Đang tải...</p>
                    </div>
                  </div>
                </li>
              ) : notifications.length === 0 ? (
                <li className="notification-message">
                  <div className="media d-flex">
                    <div className="media-body flex-grow-1">
                      <p className="noti-details">Không có thông báo nào</p>
                    </div>
                  </div>
                </li>
              ) : (
                notifications.map((notification) => (
                  notification.status === 'DISPLAY' && (
                    <li
                      key={notification._id}
                      className="notification-message"
                      style={{
                        ...styles.notificationMessage,
                        ...(notification.isRead ? {} : styles.unreadNotification),
                        ...(notification.url ? styles.clickableNotification : {})
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="media d-flex justify-content-between align-items-start">
                        <div className="d-flex flex-grow-1">
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
                          <div className="media-body">
                            <p className="noti-details">
                              {notification.title}
                            </p>
                            <p className="noti-details">
                              <span style={{ fontSize: 13 }} className="noti-title">
                                {notification.content}
                              </span>
                            </p>
                            <p className="noti-time">
                              <span className="notification-time">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                            </p>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <button
                            className="btn btn-sm btn-light mark-as-read"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleMarkNotificationRead(notification._id);
                            }}
                            style={styles.markAsReadBtn}
                          >
                            <i className='bx bx-check-double'></i>
                          </button>
                        )}
                      </div>
                    </li>
                  )
                ))
              )}
            </ul>
          </div>
          <div className="topnav-dropdown-footer">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleViewAllNotifications();
              }}
            >
              Xem tất cả thông báo
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;