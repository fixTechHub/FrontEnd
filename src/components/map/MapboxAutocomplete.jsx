// import React, { useState, useCallback } from 'react';

// // 🔑 THAY ĐỔI TOKEN NÀY BẰNG TOKEN THẬT CỦA BẠN
// const MAPBOX_TOKEN = 'pk.eyJ1IjoiZHRyaTE3IiwiYSI6ImNtYnE1ajRrZDAwODQya3B1bWFxeGQ0N3UifQ.BTrS_nLQlq3yG-HhWbsSXw';

// const MapboxAutocomplete = ({ onSelect }) => {
//   const [query, setQuery] = useState('');
//   const [suggestions, setSuggestions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const search = useCallback(async (query) => {
//     if (!query || query.length < 2) {
//       setSuggestions([]);
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const encodedQuery = encodeURIComponent(query);
//       const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?` + 
//         new URLSearchParams({
//           access_token: MAPBOX_TOKEN,
//           language: 'vi',
//           country: 'VN',
//           types: 'address,place,locality,neighborhood,street,poi',
//           limit: 5,
//           autocomplete: true
//         }).toString();

//       const response = await fetch(url);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('Mapbox response:', data);
      
//       if (data.features) {
//         setSuggestions(data.features);
//       } else {
//         setSuggestions([]);
//       }
//     } catch (error) {
//       console.error('Error fetching suggestions:', error);
//       setError('Không thể tìm kiếm địa chỉ. Vui lòng thử lại.');
//       setSuggestions([]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     setQuery(value);
//     search(value);
//   };

//   const handleSuggestionClick = (suggestion) => {
//     setQuery(suggestion.place_name);
//     setSuggestions([]);
//     if (onSelect) {
//       onSelect(suggestion);
//     }
//   };

//   return (
//     <div style={{ position: 'relative', width: '100%' }}>
//       <input
//         type="text"
//         value={query}
//         onChange={handleInputChange}
//         placeholder="Nhập địa chỉ..."
//         style={{
//           width: '100%',
//           padding: '10px',
//           fontSize: '16px',
//           border: '1px solid #ddd',
//           borderRadius: '4px',
//           boxSizing: 'border-box'
//         }}
//       />
      
//       {isLoading && (
//         <div style={{ 
//           position: 'absolute', 
//           top: '100%', 
//           left: 0, 
//           right: 0,
//           background: 'white',
//           padding: '10px',
//           border: '1px solid #ddd',
//           borderRadius: '4px',
//           zIndex: 1000
//         }}>
//           Đang tìm kiếm...
//         </div>
//       )}

//       {error && (
//         <div style={{ 
//           color: 'red', 
//           marginTop: '5px',
//           fontSize: '14px'
//         }}>
//           {error}
//         </div>
//       )}

//       {suggestions.length > 0 && (
//         <ul style={{
//           position: 'absolute',
//           top: '100%',
//           left: 0,
//           right: 0,
//           margin: 0,
//           padding: 0,
//           listStyle: 'none',
//           background: 'white',
//           border: '1px solid #ddd',
//           borderRadius: '4px',
//           maxHeight: '200px',
//           overflowY: 'auto',
//           zIndex: 1000
//         }}>
//           {suggestions.map((suggestion) => (
//             <li
//               key={suggestion.id}
//               onClick={() => handleSuggestionClick(suggestion)}
//               style={{
//                 padding: '10px',
//                 cursor: 'pointer',
//                 borderBottom: '1px solid #eee'
//               }}
//             >
//               {suggestion.place_name}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default MapboxAutocomplete; 