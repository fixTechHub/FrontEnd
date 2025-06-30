import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App.jsx'
import './index.css'

// Import CSS cho các thư viện
// import 'aos/dist/aos.css'
// import 'owl.carousel/dist/assets/owl.carousel.css'
// import 'owl.carousel/dist/assets/owl.theme.default.css'
import store from './app/store';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

//File khởi tạo app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)