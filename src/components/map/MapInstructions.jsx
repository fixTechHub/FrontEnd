import React from 'react';

const MapInstructions = () => {
  return (
    <div style={{ 
      background: '#f0f8ff', 
      padding: '15px', 
      borderRadius: '5px', 
      marginBottom: '20px',
      border: '1px solid #b0d4f1'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>📍 Chọn Vị Trí Trên Bản Đồ</h3>
      <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
        <p style={{ margin: '0 0 5px 0' }}>• <strong>Click</strong> trên bản đồ để chọn vị trí</p>
        <p style={{ margin: '0 0 5px 0' }}>• <strong>Kéo thả</strong> marker đỏ để di chuyển</p>
        <p style={{ margin: '0' }}>• Sử dụng nút GPS để lấy vị trí hiện tại</p>
      </div>
    </div>
  );
};

export default MapInstructions; 