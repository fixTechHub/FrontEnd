import { useEffect, useState } from 'react';
import './App.css';
import AppRoutes from './routes';
import AppProvider from '../src/app/AppProvider';
import { disconnectSocket, initializeSocket } from './services/socket';
import ApiBE from './services/ApiBE';
import { useDispatch } from 'react-redux';

function App() {
  const dispatch = useDispatch();

  const [user, setUserInfo] = useState(null);
    useEffect(() => {
      const loadMe = async () => {
        try {
          const res = await ApiBE.get('auth/me', { withCredentials: true });
          setUserInfo(res?.data || null);
        } catch (e) {
          setUserInfo(null);
        }
      };
      loadMe();
    }, []);
  useEffect(() => {
          if (user) {
              console.log('--- Initializing socket for user:', user?.id);
              initializeSocket(user?.id);
          } else {
              console.log('--- Disconnecting socket on logout ---');
              disconnectSocket();
          }
      }, [user, dispatch]);
  return <AppRoutes />;
}

export default App;

