import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks';

import { hideNotification } from '../../store/slices/uiSlice';

const NotificationContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { message, type, visible } = useAppSelector((state) => state.ui.notification);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, dispatch]);

  if (!visible) {
    return null;
  }

  const baseClasses = 'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return <div className={`${baseClasses} ${typeClasses[(type ?? 'info') as keyof typeof typeClasses]}`}>{message}</div>;
};

export default NotificationContainer;
