import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App.jsx'
import './index.css'

// Import CSS cho các thư viện
import 'aos/dist/aos.css'
import 'owl.carousel/dist/assets/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.theme.default.css'
import store from './app/store.js';
import { checkAuthThunk } from './features/auth/authSlice.js';

// Gọi checkAuthThunk ngay khi store được khởi tạo
store.dispatch(checkAuthThunk());


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
)
