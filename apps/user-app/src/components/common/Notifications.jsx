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
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: '0',
    width: '350px',
    maxWidth: 'calc(100vw - 20px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 1050,
  }
};
const Notifications = ({ userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, status } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = event.target.closest('.noti-wrapper');
      if (!dropdown && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

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

  const handleNotificationClick = (notification, e) => {
    e.stopPropagation();
    if (notification.url) {
      if (!notification.isRead) {
        dispatch(markNotificationAsReadThunk(notification._id));
      }
      const targetUrl = notification.url.startsWith('/')
        ? notification.url
        : `/${notification.url}`;
      try {
        navigate(targetUrl);
        setIsOpen(false); // Chỉ đóng khi navigate
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  };

  const handleMarkNotificationRead = (notificationId, e) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(markNotificationAsReadThunk(notificationId));
  };

  const handleClearAll = () => {
    dispatch(clearAllNotificationsThunk()).then(() => {
      dispatch(clearNotifications());
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

  const unreadCount = notifications.filter((n) => !n.isRead && n.status === 'DISPLAY').length;

  return (
    <div className="nav-item dropdown logged-item noti-nav noti-wrapper">
      <a
        href="#"
        className="dropdown-toggle nav-link"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <span style={styles.bellIcon}>
          <img src="/img/icons/bell-icon.svg" alt="Bell" />
        </span>
        {unreadCount > 0 && (
          <span style={{ ...styles.badgePill, ...styles.badgePillLarge }}>{unreadCount}</span>
        )}
      </a>

      {isOpen && (
        <div 
          className="dropdown-menu notifications show"
          onClick={(e) => e.stopPropagation()}
          style={styles.dropdownMenu}
        >
          <div className="topnav-dropdown-header" style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            borderBottom: '1px solid #e9ecef',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            <span className="notification-title" style={{ 
              color: '#333',
              fontSize: '16px',
              fontWeight: '600',
              margin: 0
            }}>Thông Báo</span>
            <a
              href="#"
              className="clear-noti"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClearAll();
              }}
              style={{
                color: '#007bff',
                fontSize: '14px',
                textDecoration: 'none',
                fontWeight: '500'
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
                        ...(notification.url ? styles.clickableNotification : {}),
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}
                      onClick={(e) => handleNotificationClick(notification, e)}
                    >
                      <div className="media d-flex justify-content-between align-items-start">
                        <div className="d-flex flex-grow-1">
                         
                          <div className="media-body" style={{ minWidth: 0, flex: 1 }}>
                            <p className="noti-details" style={{ 
                              margin: '0 0 8px 0',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal',
                              lineHeight: '1.4'
                            }}>
                              {notification.title}
                            </p>
                            <p className="noti-details" style={{
                              margin: '0 0 8px 0',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              whiteSpace: 'normal'
                            }}>
                              <span style={{ 
                                fontSize: 13,
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                                display: 'block'
                              }} className="noti-title">
                                {notification.content}
                              </span>
                            </p>
                            <p className="noti-time" style={{ margin: '0' }}>
                              <span className="notification-time">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                            </p>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <button
                            className="btn btn-sm btn-light mark-as-read"
                            onClick={(e) => handleMarkNotificationRead(notification._id, e)}
                            style={{
                              ...styles.markAsReadBtn,
                              flexShrink: 0,
                              minWidth: '32px',
                              height: '32px',
                              padding: '4px'
                            }}
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
       
        </div>
      )}
    </div>
  );
};

export default Notifications;