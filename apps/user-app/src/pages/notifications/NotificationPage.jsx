import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAllNotificationsThunk,
  markNotificationAsReadThunk,
  clearAllNotificationsThunk,
  addNotification,
  updateNotification,
  clearNotifications,
} from '../../features/notifications/notificationSlice';
import { onReceiveNotification, onNotificationUpdated } from '../../services/socket';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  clearAllBtn: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    color: '#6c757d',
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  notificationMessage: {
    padding: '10px 15px',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s',
    cursor: 'default',
  },
  clickableNotification: {
    cursor: 'pointer',
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
    },
  },
  unreadNotification: {
    backgroundColor: '#f8f9fa',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  paginationBtn: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    color: '#6c757d',
    padding: '5px 10px',
    margin: '0 5px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  noNotifications: {
    textAlign: 'center',
    padding: '20px',
    color: '#6c757d',
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#6c757d',
  },
};

const NotificationsPage = ({ userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, status } = useSelector((state) => state.notifications);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (userId) {
      dispatch(fetchAllNotificationsThunk({ limit, skip: page * limit }));
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
  }, [dispatch, userId, page]);

  const handleNotificationClick = (notification) => {
    if (notification.url) {
      navigate(notification.url);
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

  const handlePageChange = (newPage) => {
    setPage(newPage);
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Tất cả thông báo </h2>
        <button
          style={styles.clearAllBtn}
          onClick={handleClearAll}
          disabled={status === 'loading' || notifications.length === 0}
        >
      Xóa Tất Cả
        </button>
      </div>
      {status === 'loading' ? (
        <div style={styles.loading}>Đang tải...</div>
      ) : notifications.length === 0 ? (
        <div style={styles.noNotifications}>Không có thông báo nào </div>
      ) : (
        <ul className="notification-list" style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map(
            (notification) =>
              notification.status === 'DISPLAY' && (
                <li
                  key={notification._id}
                  className="notification-message"
                  style={{
                    ...styles.notificationMessage,
                    ...(notification.isRead ? {} : styles.unreadNotification),
                    ...(notification.url ? styles.clickableNotification : {}),
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="media d-flex justify-content-between align-items-start">
                    <div className="d-flex flex-grow-1">
                      <span className="avatar avatar-lg flex-shrink-0">
                        <img
                          className="avatar-img rounded-circle"
                          alt="User Image"
                          src={notification.userAvatar || '/img/profiles/avatar-01.jpg'}
                          style={{ width: '40px', height: '40px' }}
                        />
                      </span>
                      <div className="media-body" style={{ marginLeft: '10px' }}>
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
                    {!notification.isRead && (
                      <button
                        className="btn btn-sm btn-light mark-as-read"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkNotificationRead(notification._id);
                        }}
                        style={styles.markAsReadBtn}
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                </li>
              )
          )}
        </ul>
      )}
      <div style={styles.pagination}>
        <button
          style={{
            ...styles.paginationBtn,
            ...(page === 0 ? styles.disabledBtn : {}),
          }}
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0}
        >
          Trang Trước
        </button>
        <button
          style={{
            ...styles.paginationBtn,
            ...(notifications.length < limit ? styles.disabledBtn : {}),
          }}
          onClick={() => handlePageChange(page + 1)}
          disabled={notifications.length < limit}
        >
          Trang Sau
        </button>
      </div>
    </div>
  );
};

export default NotificationsPage;