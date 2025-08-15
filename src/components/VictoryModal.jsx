import React from 'react';

const VictoryModal = ({ isVisible, onClose, onPlayAgain, onReturnToMenu }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl border-4 border-yellow-400">
        {/* Victory Header */}
        <div className="mb-6">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-yellow-600 mb-2">
            VICTORY!
          </h2>
          <div className="text-lg text-gray-700">
            🎊 Congratulations! 🎊
          </div>
        </div>
        
        {/* Victory Message */}
        <div className="mb-8 space-y-3">
          <p className="text-lg font-semibold text-green-700">
            🐱 You successfully crossed the entire bridge! 🌉
          </p>
          <p className="text-gray-600">
            Your clever cat has outwitted Wolfy through all 10 levels of challenges!
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-yellow-800 font-medium">
              ✨ The bridge now glows with eternal moonlight, 
              <br />
              and Wolfy tips his hat in respect! ✨
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 justify-center">
          <div className="flex gap-3 justify-center">
            <button
              onClick={onPlayAgain}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              🔄 Play Again
            </button>
            <button
              onClick={onReturnToMenu}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
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
        
        {/* Celebration Effects */}
        <div className="mt-6 text-4xl animate-bounce">
          🎉 🌟 🎊 🌙 🎉
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;
