import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import ToastProvider from '../components/common/ToastProvider';
const AppProvider = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
      <ToastProvider />
    </Provider>
  );
};
export default AppProvider;