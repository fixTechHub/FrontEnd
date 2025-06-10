import React from 'react';

const LocationInfo = ({ selectedLocation, isLoading }) => {
  if (!selectedLocation) return null;

  return (
    <div style={{
      marginTop: '15px',
      background: '#dcfce7',
      border: '1px solid #86efac',
      padding: '15px',
      borderRadius: '5px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#16a34a' }}>📍 Vị trí đã chọn:</h4>
      <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
        <strong>Địa chỉ:</strong> {isLoading ? 'Đang tải...' : selectedLocation.address}
      </p>
      <p style={{ margin: '0', fontSize: '14px' }}>
        <strong>Tọa độ:</strong> {selectedLocation.location.coordinates[1].toFixed(6)}, {selectedLocation.location.coordinates[0].toFixed(6)}
      </p>
    </div>
  );
};

export default LocationInfo; 