import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
// import ToastProvider from '../components/common/ToastProvider';
const AppProvider = ({ children }) => {
  return (
    <Provider store={store}>
      {/* <ToastProvider /> */}

      {children}
    
    </Provider>
  );
};
export default AppProvider;