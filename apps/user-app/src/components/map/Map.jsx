import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_POSITION = {
    lng: 108.2022,
    lat: 16.0544,
};

const Map = ({ address, onLocationChange }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [lngLat, setLngLat] = useState(DEFAULT_POSITION);
    const [internalAddress, setInternalAddress] = useState("");

    // Geocode address string to lngLat
    const geocodeAddress = async (addr) => {
        if (!addr) return;
        const token = mapboxgl.accessToken;
        const bbox = "108.0,15.9,108.35,16.15"; // Giới hạn Đà Nẵng
        // const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json?access_token=${token}`;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr)}.json?bbox=${bbox}&access_token=${token}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const [lng, lat] = feature.center;
            setLngLat({ lng, lat });
            setInternalAddress(feature.place_name);
            if (onLocationChange) onLocationChange(feature.place_name, { lat, lng });
            if (markerRef.current) markerRef.current.setLngLat([lng, lat]);
            if (mapRef.current) mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
        } else {
            if (onLocationChange) onLocationChange("", null);
        }
    };

    // Reverse geocode lngLat to address string
    const reverseGeocode = async (lat, lng) => {
        const token = mapboxgl.accessToken;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`;
        const res = await fetch(url);
        const data = await res.json();

        const geoJson = {
            type: "Point",
            coordinates: [lng, lat],
        };

        console.log("📍 GeoJSON vị trí hiện tại:", geoJson);

        if (data.features && data.features.length > 0) {
            setInternalAddress(data.features[0].place_name);
            if (onLocationChange) onLocationChange(data.features[0].place_name, { lat, lng });
        } else {
            if (onLocationChange) onLocationChange("", { lat, lng });
        }
    };

    // Khi prop address thay đổi, geocode
    useEffect(() => {
        if (address && address !== internalAddress) {
            geocodeAddress(address);
        }
    }, [address]);

    // Khởi tạo map và marker
    useEffect(() => {
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [lngLat.lng, lngLat.lat],
            zoom: 13,
        });

        markerRef.current = new mapboxgl.Marker({ draggable: true })
            .setLngLat([lngLat.lng, lngLat.lat])
            .addTo(mapRef.current);

        // Khi kéo marker
        markerRef.current.on("dragend", () => {
            const newPos = markerRef.current.getLngLat();
            setLngLat({ lat: newPos.lat, lng: newPos.lng });
            reverseGeocode(newPos.lat, newPos.lng);
        });

        // Khi click trên map
        mapRef.current.on("click", (e) => {
            const { lng, lat } = e.lngLat;
            setLngLat({ lat, lng });
            markerRef.current.setLngLat([lng, lat]);
            reverseGeocode(lat, lng);
        });

        // Lần đầu tiên gọi reverse geocode
        reverseGeocode(lngLat.lat, lngLat.lng);

        return () => mapRef.current.remove();
    }, []);

    // Khi lngLat thay đổi từ bên ngoài (ví dụ nhập địa chỉ), di chuyển marker/map
    useEffect(() => {
        if (markerRef.current && mapRef.current) {
            markerRef.current.setLngLat([lngLat.lng, lngLat.lat]);
            mapRef.current.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 14 });
        }
    }, [lngLat]);

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Trình duyệt không hỗ trợ định vị.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLngLat({ lat: latitude, lng: longitude });
                if (markerRef.current) markerRef.current.setLngLat([longitude, latitude]);
                if (mapRef.current) mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14 });
                reverseGeocode(latitude, longitude);
            },
            (error) => {
                console.error("Lỗi định vị:", error);
                if (error.code === 1) {
                    alert("Bạn đã từ chối quyền truy cập vị trí.");
                } else {
                    alert("Không thể lấy vị trí hiện tại.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return (
        <div style={{ position: "relative", width: "100%" }}>
            <button
                onClick={handleGetCurrentLocation}
                style={{
                    position: "absolute",
                    bottom: 30,
                    right: 25,
                    zIndex: 2,
                    padding: "10px 14px",
                    borderRadius: 6,
                }}
            >
                <i className="bx bx-current-location"></i>
            </button>
            <div
                ref={mapContainerRef}
                style={{ width: "100%", height: "500px", borderRadius: "10px" }}
            />
        </div>
    );
};

export default Map;
