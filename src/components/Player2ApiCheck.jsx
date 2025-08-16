import React, { useState, useEffect } from 'react';
import { checkApiAvailability } from '../services/apiCheck';
import soundManager from '../services/soundManager';

function Player2ApiCheck({ onClose, isVisible }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  useEffect(() => {
    if (isVisible) {
      checkApiStatus();
    }
  }, [isVisible]);

  const checkApiStatus = async () => {
    setIsChecking(true);
    const available = await checkApiAvailability();
    setIsApiAvailable(available);
    setIsChecking(false);
    
    // If API is available, automatically close after a short delay
    if (available) {
      setTimeout(() => {
        onClose(true);
      }, 2000);
    }
  };

  const handleRetryClick = () => {
    soundManager.playClickSound();
    checkApiStatus();
  };

  const handleInstallClick = () => {
    soundManager.playClickSound();
    // Open Player2 website in a new tab
    window.open('https://player2.game/', '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl max-w-md w-full border-2 border-indigo-300 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 pb-4 flex-shrink-0">
          <div className="flex items-center">
            <img 
              src="https://yt3.ggpht.com/g0ovdGFuUdW3sFubN632nXg5G5cmw2mG6tu3kHqvHqMaQit5B9wAe6mSXz1zHSLcQk8i7CyDmw=s68-c-k-c0x00ffffff-no-rj" 
              alt="Player2 Logo" 
              className="w-10 h-10 mr-3 rounded-full"
            />
            <h2 className="text-2xl font-bold text-indigo-800">Player2 Check</h2>
          </div>
          <button 
            onClick={() => onClose(isApiAvailable)}
            className="text-indigo-600 hover:text-indigo-800 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="px-6 py-4 flex-1">
          <div className="space-y-4 text-indigo-700">
            {isChecking ? (
              <div className="text-center py-6">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-400 border-t-transparent mb-4"></div>
                <p className="text-lg font-medium">Checking Player2 API connection...</p>
              </div>
            ) : isApiAvailable ? (
              <div className="bg-green-100 p-4 rounded-lg border border-green-200 text-center">
                <div className="text-5xl mb-2">✅</div>
                <h3 className="font-bold text-lg mb-2 text-green-700">Player2 API Connected!</h3>
                <p className="text-green-700">
                  The game is ready to play. Enjoy your adventure!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-100 p-4 rounded-lg border border-amber-200 text-center">
                  <div className="text-5xl mb-2">⚠️</div>
                  <h3 className="font-bold text-lg mb-2 text-amber-700">Player2 API Not Found</h3>
                  <p className="text-amber-700">
                    This game requires the Player2 app to be installed and running.
                  </p>
                </div>
                
                <div className="bg-indigo-100 p-4 rounded-lg border border-indigo-200">
                  <h3 className="font-bold text-lg mb-2">How to Fix:</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Download and install the Player2 app</li>
                    <li>Launch the Player2 app</li>
                    <li>Keep it running in the background</li>
                    <li>Click "Retry" to check connection</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 pt-4 text-center flex-shrink-0 border-t border-indigo-200">
          {!isChecking && !isApiAvailable ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={handleInstallClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex-1"
              >
                Install Player2 🚀
              </button>
              <button 
                onClick={handleRetryClick}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex-1"
              >
                Retry Connection 🔄
              </button>
            </div>
          ) : !isChecking && isApiAvailable ? (
            <button 
              onClick={() => onClose(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Continue to Game ▶️
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Player2ApiCheck;
