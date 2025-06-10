import React from 'react';

const MapStatus = ({ mapboxLoaded, error, mapboxToken }) => {
  if (!mapboxLoaded && !error) {
    return (
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        color: '#856404',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <strong>⏳ Đang tải Mapbox GL...</strong>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#fee2e2',
        border: '1px solid #fca5a5',
        color: '#dc2626',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <strong>❌ Lỗi:</strong> {error}
        <br />
        <small>Vui lòng kiểm tra token Mapbox của bạn</small>
      </div>
    );
  }

  if (mapboxLoaded && !error && !mapboxToken.startsWith('pk.')) {
    return (
      <div style={{
        background: '#fee2e2',
        border: '1px solid #fca5a5',
        color: '#dc2626',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <strong>⚠️ Cảnh báo:</strong> Vui lòng thay thế token Mapbox hợp lệ!
      </div>
    );
  }

  return null;
};

export default MapStatus; 