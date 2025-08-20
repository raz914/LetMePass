import React from 'react';
import './ChatInput.css';
import soundManager from '../services/soundManager';

const ChatInput = ({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  gameState, 
  isLoading,
  getMaxHints
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      soundManager.playClickSound();
      onSendMessage();
    }
  };

  const getPlaceholder = () => {
    if (isLoading) {
      return "Wolfy is thinking...";
    }
    if (!gameState.isPlaying) {
      return "Click PLAY GAME to begin your adventure! 🌉";
    }
    if (gameState.gameOver) {
      return gameState.bridgeCrossed ? "Quest Complete! 🏆" : "Game Over! 💀";
    }
    if (gameState.bridgeCrossed) {
      return "Quest Complete! 🏆";
    }
    if (gameState.isMoving) {
      return "Cat walking... 🚶";
    }
    return `Level ${gameState.level}: Say something! 🌙`;
  };

  const getStatusMessage = () => {
    if (!gameState.isPlaying) {
      return "🌟 Ready to challenge Wolfy!";
    }
    if (gameState.gameOver) {
      return gameState.bridgeCrossed ? "🏆 VICTORY! All levels conquered!" : "💀 DEFEAT! Try again!";
    }
    if (gameState.bridgeCrossed) {
      return "🏆 VICTORY! All levels conquered!";
    }
    if (gameState.isMoving) {
      return "🚶‍♂️ Cat walking to next level...";
    }
    
    // Add hint information when playing
    const maxHints = getMaxHints ? getMaxHints() : 3;
    const hintsRemaining = maxHints - (gameState.hintsUsed || 0);
    const hintStatus = hintsRemaining > 0 ? `💡 ${hintsRemaining} hints left` : `💡 No hints left`;
    
    return `🐺 Level ${gameState.level}/${gameState.maxLevels} - Wolfy awaits! | ${hintStatus}`;
  };

  const isInputDisabled = !gameState.isPlaying || isLoading || gameState.bridgeCrossed || gameState.isMoving || gameState.gameOver;
  const isSendDisabled = !inputMessage.trim() || !gameState.isPlaying || isLoading || gameState.bridgeCrossed || gameState.isMoving || gameState.gameOver;

  return (
    <div className="input-container">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            disabled={isInputDisabled}
            className={`w-full px-6 py-4 text-lg border-3 border-purple-300 rounded-full focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-lg ${isLoading ? 'text-transparent' : ''}`}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            soundManager.playClickSound();
            onSendMessage();
          }}
          disabled={isSendDisabled}
          className="px-8 py-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
        >
          {isLoading ? '💭' : '💬'}
        </button>
      </div>
      
      <div className="mt-3 text-base text-gray-700 text-center">
        <p>{getStatusMessage()}</p>
      </div>
    </div>
  );
};

export default ChatInput;