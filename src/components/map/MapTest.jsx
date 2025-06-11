import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_CENTER = [108.2022, 16.0612]; // Đà Nẵng
const DEFAULT_ZOOM = 12;

const MapTest = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('Chưa có');
  const [coords, setCoords] = useState(null);

  // Lấy địa chỉ từ tọa độ
  const getAddressFromCoordinates = useCallback(async (lng, lat) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=vi`
      );
      if (!response.ok) throw new Error('Không thể lấy địa chỉ');
      const data = await response.json();
      if (data.features && data.features.length > 0) return data.features[0].place_name;
      return 'Không tìm thấy địa chỉ';
    } catch {
      return 'Không thể lấy địa chỉ';
    }
  }, []);

  // Lấy vị trí hiện tại
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị GPS');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (map.current && marker.current) {
          map.current.flyTo({ center: [longitude, latitude], zoom: 15, essential: true });
          marker.current.setLngLat([longitude, latitude]);
          setCoords([longitude, latitude]);
          setAddress(await getAddressFromCoordinates(longitude, latitude));
        }
        setIsLoading(false);
      },
      () => {
        alert('Không thể lấy vị trí hiện tại.');
        setIsLoading(false);
      }
    );
  }, [getAddressFromCoordinates]);

  // Khởi tạo map
  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM
    });
    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat(DEFAULT_CENTER)
      .addTo(map.current);
    setCoords(DEFAULT_CENTER);
    getAddressFromCoordinates(DEFAULT_CENTER[0], DEFAULT_CENTER[1]).then(setAddress);
    marker.current.on('dragend', async () => {
      const lngLat = marker.current.getLngLat();
      setCoords([lngLat.lng, lngLat.lat]);
      setAddress(await getAddressFromCoordinates(lngLat.lng, lngLat.lat));
    });
    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      marker.current.setLngLat([lng, lat]);
      setCoords([lng, lat]);
      setAddress(await getAddressFromCoordinates(lng, lat));
    });
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [getAddressFromCoordinates]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 500, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
        <button
          onClick={getCurrentLocation}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{
                width: '16px',
                height: '16px',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Đang tìm...
            </>
          ) : (
            <>
              <span role="img" aria-label="location">📍</span>
              Vị trí hiện tại
            </>
          )}
        </button>
      </div>
      <div ref={mapContainer} style={{ width: '100%', height: 400, minHeight: 400, borderRadius: 8, overflow: 'hidden' }} />
      <div style={{ marginTop: 16, background: '#f0f9ff', padding: 16, borderRadius: 8 }}>
        <div><b>Địa chỉ:</b> {address || 'Chưa có'}</div>
        <div><b>Tọa độ (Lng, Lat):</b> {coords ? `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}` : 'Chưa có'}</div>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default MapTest; 