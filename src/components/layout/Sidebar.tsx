import React from 'react';
import { useAppSelector } from '../../store/hooks';

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const { isSidebarVisible } = useAppSelector((state) => state.ui);

  return (
    <div
      data-sidebar
      className={`
        transition-all duration-300 ease-in-out
        ${isSidebarVisible ? 'w-80' : 'w-0'}
        overflow-hidden
        bg-white dark:bg-gray-800
        border-r border-gray-200 dark:border-gray-700
        flex-shrink-0
      `}
    >
      <div className="h-full w-80">{children}</div>
    </div>
  );
};
