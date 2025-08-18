import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Badge, Dropdown, Button, List, Typography, Spin, Empty } from 'antd';
import { BellOutlined, CheckOutlined, ClearOutlined } from '@ant-design/icons';
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
} from '../../features/notifications/notificationsSlice';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const Notifications = ({ userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, status } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotificationsThunk(userId));
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
    dispatch(clearAllNotificationsThunk(userId)).then(() => {
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

  const dropdownContent = (
    <div style={{ width: 350, maxHeight: 400, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafafa'
      }}>
        <Title level={5} style={{ margin: 0, color: '#262626' }}>
          Thông Báo
        </Title>
        <Button
          type="text"
          size="small"
          icon={<ClearOutlined />}
          onClick={(e) => {
            e.preventDefault();
            handleClearAll();
          }}
          style={{ color: '#1890ff' }}
        >
          Xóa tất cả
        </Button>
      </div>

      {/* Content */}
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {status === 'loading' ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spin size="default" />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Đang tải...</Text>
            </div>
          </div>
        ) : notifications.length === 0 || !notifications.some(n => n.status === 'DISPLAY') ? (
          <div style={{ padding: '40px' }}>
            <Empty
              description="Không có thông báo nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <List
            itemLayout="vertical"
            size="small"
            split={false}
            dataSource={notifications.filter(n => n.status === 'DISPLAY')}
            renderItem={(notification) => (
              <List.Item
                key={notification._id}
                style={{
                  padding: '12px 16px',
                  backgroundColor: notification.isRead ? '#ffffff' : '#f6ffed',
                  borderLeft: notification.isRead ? 'none' : '3px solid #52c41a',
                  cursor: notification.url ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                }}
                className="notification-item"
                onClick={() => handleNotificationClick(notification)}
                onMouseEnter={(e) => {
                  if (notification.url) {
                    e.currentTarget.style.backgroundColor = notification.isRead ? '#f5f5f5' : '#f0f9f0';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = notification.isRead ? '#ffffff' : '#f6ffed';
                }}
                actions={[
                  !notification.isRead && (
                    <Button
                      key="mark-read"
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleMarkNotificationRead(notification._id);
                      }}
                      style={{
                        color: '#52c41a',
                        border: '1px solid #d9f7be',
                        borderRadius: '6px',
                      }}
                    />
                  )
                ]}
              >
                <div style={{ paddingRight: !notification.isRead ? '40px' : '0' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                      {notification.title}
                    </Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text style={{ fontSize: '13px', color: '#595959', lineHeight: '1.4' }}>
                      {notification.content}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {getTimeAgo(notification.createdAt)}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      open={isOpen}
      onOpenChange={setIsOpen}
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      overlayStyle={{
        boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="notification-trigger" style={{ position: 'relative', cursor: 'pointer' }}>
        <Badge count={unreadCount} size="default" offset={[-2, 2]}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            border: '1px solid #d9d9d9'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e6f7ff';
            e.currentTarget.style.borderColor = '#1890ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
            e.currentTarget.style.borderColor = '#d9d9d9';
          }}
          >
            <BellOutlined style={{ fontSize: '18px', color: '#595959' }} />
          </div>
        </Badge>
      </div>
    </Dropdown>
  );
};

export default Notifications;