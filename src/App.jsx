import { ToastContainer } from 'react-toastify';
import AppRoutes from './routes';
import AuthVerification from './features/auth/AuthVerification.js';
import AppProvider from './app/AppProvider';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
      <AppProvider>
      <AuthVerification />
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      </AppProvider>
  );
}

export default App;
