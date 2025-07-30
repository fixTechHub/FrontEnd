import React, { useEffect } from 'react';
import { Button } from 'antd';
import { UpOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setBackToTopVisibility } from '../features/ui/uiSlice';

const BackToTop = () => {
  const dispatch = useDispatch();
  const isVisible = useSelector((state) => state.ui.isBackToTopVisible);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      dispatch(setBackToTopVisibility(true));
    } else {
      dispatch(setBackToTopVisibility(false));
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [dispatch]);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <Button
          type="primary"
          shape="circle"
          icon={<UpOutlined />}
          size="large"
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '50px',
            right: '50px',
            zIndex: 1000,
          }}
        />
      )}
    </>
  );
};

export default BackToTop; 