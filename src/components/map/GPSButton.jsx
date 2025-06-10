import React from 'react';

const GPSButton = ({ onClick, disabled, isLoading }) => {
  return (
    <div style={{ marginBottom: '10px' }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          background: '#059669',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          opacity: disabled ? 0.6 : 1
        }}
      >
        {isLoading ? '🌀 Đang lấy vị trí...' : '📍 Vị trí hiện tại'}
      </button>
    </div>
  );
};

export default GPSButton; 