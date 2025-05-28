import { Provider } from 'react-redux';
import store from './app/store'; // Redux store
import AppRoutes from './routes/index'; // Cấu hình router
import AppProvider from './app/AppProvider';

function App() {
  return (
    <Provider store={store}>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </Provider>
  );
}

export default App;
