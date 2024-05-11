import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  icon?: JSX.Element; // Optional SVG icon
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, icon, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Automatically close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-0 right-0 mb-4 mr-4 flex text-sm items-center justify-between bg-gray-800 text-white p-3 rounded-lg shadow-lg max-w-sm">
      {icon && <div className="mr-3">{icon}</div>}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-4 text-gray-300 hover:text-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
