import React from 'react';

const MapContainer = ({ mapContainerRef, mapboxLoaded, error }) => {
  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        height: '400px', 
        width: '100%', 
        borderRadius: '8px',
        border: '2px solid #e5e7eb',
        background: '#f9fafb',
        position: 'relative'
      }}
    >
      {(!mapboxLoaded || error) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🗺️</div>
          <div>
            {error ? 'Có lỗi xảy ra' : 'Đang tải bản đồ...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer; 