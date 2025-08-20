import React, { memo } from 'react';
import DebugPanel from './DebugPanel';
import soundManager from '../services/soundManager';

const GameControls = ({ 
  gameState, 
  isLoading, 
  npcService, 
  debugService,
  setIsLoading, 
  setMessages, 
  showDebug, 
  setShowDebug 
}) => {
  // Total lives for the entire game (same logic as GameContext)
  const getMaxHints = () => {
    return 3; // 9 total lives for all levels
  };

  const maxHints = getMaxHints();
  const remainingHints = Math.max(0, maxHints - gameState.hintsUsed);
  return (
    <div className="header-section mb-4">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800">
        🌲 Bridge of Whim & Warden 🐺
      </h1>
      
      {/* Minimal Game Status */}
      {gameState.isPlaying && (
        <div className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-200">
          {/* Mobile Layout: Compact single row */}
          <div className="md:hidden flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎮</span>
              <span className="font-bold text-gray-800 text-sm">L{gameState.level}/{gameState.maxLevels}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className={`font-bold ${remainingHints === 0 ? 'text-red-600' : remainingHints === 1 ? 'text-orange-600' : 'text-purple-600'}`}>
                💡 {remainingHints}
              </div>
              {gameState.timerActive && (
                <div className={`font-bold text-xs ${
                  gameState.timeRemaining <= 60000 ? 'text-red-600 animate-pulse' : 
                  gameState.timeRemaining <= 120000 ? 'text-orange-600' : 
                  'text-blue-600'
                }`}>
                  ⏰ {Math.floor(gameState.timeRemaining / 60000)}:{String(Math.floor((gameState.timeRemaining % 60000) / 1000)).padStart(2, '0')}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout: Full information */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎮</span>
                <span className="font-bold text-gray-800">Level {gameState.level}/{gameState.maxLevels}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(gameState.level / gameState.maxLevels) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className={`font-bold ${remainingHints === 0 ? 'text-red-600' : remainingHints === 1 ? 'text-orange-600' : 'text-purple-600'}`}>
                    💡 {gameState.hintsUsed}/{maxHints}
                  </div>
                  <div className="text-xs text-gray-500">
                    {remainingHints} hints left
                  </div>
                </div>
                
                {/* Timer Display */}
                {gameState.timerActive && (
                  <div className="text-center">
                    <div className={`font-bold ${
                      gameState.timeRemaining <= 60000 ? 'text-red-600 animate-pulse' : 
                      gameState.timeRemaining <= 120000 ? 'text-orange-600' : 
                      'text-blue-600'
                    }`}>
                      ⏰ {Math.floor(gameState.timeRemaining / 60000)}:{String(Math.floor((gameState.timeRemaining % 60000) / 1000)).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500">
                      time left
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {gameState.bridgeCrossed && (
            <div className="mt-2 p-2 bg-green-100 rounded-lg text-center">
              <div className="text-sm font-bold text-green-800">
                🏆 VICTORY! All {gameState.maxLevels} Levels Conquered!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debug Panel Component */}
      <DebugPanel 
        npcService={npcService}
        debugService={debugService}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setMessages={setMessages}
        showDebug={showDebug}
        setShowDebug={setShowDebug}
        gameState={gameState}
      />

      {/* Main Game Controls */}
      <div className="flex justify-center gap-3 items-center mb-2">
        {gameState.isPlaying ? (
          <span className="px-4 py-2 bg-purple-100 rounded-xl text-purple-800 font-medium flex items-center text-sm">
            🐺 {gameState.wolfyVisible ? 'Wolfy is guarding the bridge' : 'Wolfy is preparing...'}
          </span>
        ) : gameState.showStartScreen ? (
          <span className="px-4 py-2 bg-emerald-100 rounded-xl text-emerald-800 font-medium flex items-center text-sm">
            🌉 Ready to begin your bridge crossing adventure!
          </span>
        ) : (
          <span className="px-4 py-2 bg-blue-100 rounded-xl text-blue-800 font-medium flex items-center text-sm">
            {isLoading ? '🌟 Preparing...' : '🎮 Game Ready'}
          </span>
        )}
        
        {!showDebug && (
          <button
            onClick={() => {
              soundManager.playClickSound();
              setShowDebug(true);
            }}
            className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-xs"
          >
            🔧
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(GameControls);