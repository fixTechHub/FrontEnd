import React from 'react';
import { Provider } from 'react-redux';
import store from './store';

// Import any additional providers/context you need
// import { ThemeProvider } from '@mui/material/styles';
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const AppProvider = ({ children }) => {
  return (
    <Provider store={store}>
      {/* Add any additional providers here */}
      {/* <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
      */}
      {children}
      {/* 
        </LocalizationProvider>
      </ThemeProvider> */}
    </Provider>
  );
};

export default AppProvider;
