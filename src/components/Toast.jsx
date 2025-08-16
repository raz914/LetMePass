import React, { useEffect, useState } from 'react';

function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Allow animation to complete
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 
                 type === 'error' ? 'bg-red-500' : 
                 type === 'warning' ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div 
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${bgColor} transition-opacity duration-300 ${isVisible ? 'opacity-95' : 'opacity-0'}`}
    >
      <div className="flex items-center">
        {type === 'success' && <span className="mr-2">✅</span>}
        {type === 'error' && <span className="mr-2">❌</span>}
        {type === 'warning' && <span className="mr-2">⚠️</span>}
        {type === 'info' && <span className="mr-2">ℹ️</span>}
        <span>{message}</span>
      </div>
    </div>
  );
}

export default Toast;
