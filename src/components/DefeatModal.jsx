import React from 'react';

const DefeatModal = ({ isVisible, onClose, onTryAgain, onReturnToMenu, level, hintsUsed, maxHints, defeatReason }) => {
  if (!isVisible) return null;

  const isTimeout = defeatReason === 'timeout';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl border-4 border-red-400">
        {/* Defeat Header */}
        <div className="mb-6">
          <div className="text-6xl mb-4">{isTimeout ? '⏰' : '💀'}</div>
          <h2 className="text-3xl font-bold text-red-600 mb-2">
            {isTimeout ? 'TIME\'S UP!' : 'GAME OVER'}
          </h2>
          <div className="text-lg text-gray-700">
            {isTimeout ? '🐱 Out of time! 🐱' : '😿 Oh no! 😿'}
          </div>
        </div>
        
        {/* Defeat Message */}
        <div className="mb-8 space-y-3">
          <p className="text-lg font-semibold text-red-700">
            {isTimeout ? '⏱️ The 5-minute timer has expired!' : '🐺 Something went wrong! 🐺'}
          </p>
          <p className="text-gray-600">
            {isTimeout 
              ? 'Wolfy grows impatient! The bridge challenge has ended due to timeout.'
              : 'The game has ended unexpectedly.'
            }
          </p>
          
          {/* Level Info */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mt-4">
            <div className="text-red-800 space-y-2">
              <p className="font-medium">
                📊 Final Stats:
              </p>
              <div className="text-sm space-y-1">
                <p>🎯 Level Reached: {level}/10</p>
                <p>💡 Hints Used: {hintsUsed}</p>
                <p>📋 Total Progress: {Math.round((level/10) * 100)}% complete</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 mt-4">
            <p className="text-gray-700 text-sm font-medium">
              💡 Note: Hints are just helpful suggestions now!
              <br />
              Use them freely to get help with puzzles.
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 justify-center">
          <div className="flex gap-3 justify-center">
            <button
              onClick={onTryAgain}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              🔄 Try Again
            </button>
            <button
              onClick={onReturnToMenu}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              🏠 Main Menu
            </button>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-lg text-sm"
          >
            Close
          </button>
        </div>
        
        {/* Sad Effects */}
        <div className="mt-6 text-4xl opacity-60">
          😢 🌧️ 💔 🌙 😿
        </div>
      </div>
    </div>
  );
};

export default DefeatModal;
