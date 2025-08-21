import React, { createContext, useContext, useState, useCallback } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  // Total hints for the entire game (no longer causes defeat)
  const getMaxHints = () => {
    return 3; // 3 total hints available for all levels (for tracking only)
  };

  // Game timer constants
  // const GAME_DURATION_MS = 30 * 1000;; // 30 seconds in milliseconds

  const GAME_DURATION_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
  const timerRef = React.useRef(null);

  const [gameState, setGameState] = useState({
    level: 1,
    maxLevels: 10,
    catPosition: [4, 1.21, -0.1], // Starting position from CatModel
    isMoving: false,
    bridgeCrossed: false,
    isPlaying: false,
    showStartScreen: true, // Show start screen initially
    victoryType: null,
    hintsUsed: 0,
    gameOver: false,
    showVictoryModal: false,
    showDefeatModal: false,
    wolfyVisible: false, // Wolfy is hidden by default
    defeatSequence: false,
    // Timer state
    timeRemaining: GAME_DURATION_MS,
    timerActive: false,
    defeatReason: null // 'timeout' or other reasons
  });

  // Calculate how far the cat should move forward per level
  // Total bridge distance divided by levels (from starting position to end)
  const BRIDGE_LENGTH = 8; // Total distance to cross the bridge
  const STEP_SIZE = BRIDGE_LENGTH / 10; // Distance per level

  const moveToNextLevel = useCallback(() => {
    return new Promise((resolve) => {
      setGameState(prev => {
        const newLevel = prev.level + 1;
        const newX = prev.catPosition[0] - (STEP_SIZE); // Move forward (negative X direction)
        const isFinalVictory = newLevel > prev.maxLevels;
        
        const newState = {
          ...prev,
          level: newLevel,
          catPosition: [newX, prev.catPosition[1], prev.catPosition[2]],
          isMoving: true,
          bridgeCrossed: isFinalVictory,
          // Keep hintsUsed - track total hints used across all levels
          showVictoryModal: false, // Don't show victory modal immediately
          gameOver: isFinalVictory
        };
        
        // For final victory, show defeated animation first, then victory modal
        if (isFinalVictory) {
          // Stop the timer on final victory
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Show victory modal after defeated animation plays (3 seconds)
          setTimeout(() => {
            setGameState(prev => ({ 
              ...prev, 
              showVictoryModal: true,
              timerActive: false 
            }));
          }, 3000);
        }
        
        // Resolve with the new state after state update
        setTimeout(() => resolve(newState), 50);
        return newState;
      });

      // Stop moving animation after a delay
      setTimeout(() => {
        setGameState(prev => ({ ...prev, isMoving: false }));
      }, 2000); // 2 seconds of walking animation
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({ 
      ...prev, 
      isPlaying: true,
      showStartScreen: false,
      timerActive: true,
      timeRemaining: GAME_DURATION_MS,
      defeatReason: null 
    }));
    startTimer();
  }, []);

  const startTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        // Don't continue timer if game is over, bridge is crossed, or timer should be inactive
        if (prev.gameOver || prev.bridgeCrossed || !prev.timerActive || !prev.isPlaying) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return prev;
        }
        
        const newTimeRemaining = prev.timeRemaining - 1000; // Decrease by 1 second
        
        if (newTimeRemaining <= 0) {
          // Time's up! Trigger defeat sequence first, then modal
          clearInterval(timerRef.current);
          timerRef.current = null;
          
          // Start defeat sequence (wolfy angry animation + cat throw)
          setTimeout(() => {
            setGameState(prevState => ({
              ...prevState,
              showDefeatModal: true
            }));
          }, 3000); // Show defeat modal after 3 seconds of defeat sequence
          
          return {
            ...prev,
            timeRemaining: 0,
            timerActive: false,
            gameOver: true,
            defeatSequence: true, // This triggers the defeat animations
            defeatReason: 'timeout'
          };
        }
        
        // Only update timeRemaining to minimize re-renders
        if (prev.timeRemaining !== newTimeRemaining) {
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        }
        
        return prev; // Return same object reference if no change
      });
    }, 1000); // Update every second
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameState(prev => ({ ...prev, timerActive: false }));
  }, []);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Keep timerActive true but stop the interval - this keeps timer visible but paused
    setGameState(prev => ({ ...prev, timerActive: true }));
  }, []);

  const resumeTimer = useCallback(() => {
    // Only resume if we have time remaining and should be active
    setGameState(prev => {
      if (prev.timeRemaining > 0 && prev.isPlaying && !prev.gameOver && !prev.bridgeCrossed) {
        // Clear any existing timer first
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // Start countdown timer from current timeRemaining
        timerRef.current = setInterval(() => {
          setGameState(prevState => {
            // Don't continue timer if game is over, bridge is crossed, or timer should be inactive
            if (prevState.gameOver || prevState.bridgeCrossed || !prevState.timerActive || !prevState.isPlaying) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              return prevState;
            }
            
            const newTimeRemaining = prevState.timeRemaining - 1000; // Decrease by 1 second
            
            if (newTimeRemaining <= 0) {
              // Time's up! Trigger defeat sequence first, then modal
              clearInterval(timerRef.current);
              timerRef.current = null;
              
              // Start defeat sequence (wolfy angry animation + cat throw)
              setTimeout(() => {
                setGameState(prevStateInner => ({
                  ...prevStateInner,
                  showDefeatModal: true
                }));
              }, 3000); // Show defeat modal after 3 seconds of defeat sequence
              
              return {
                ...prevState,
                timeRemaining: 0,
                timerActive: false,
                gameOver: true,
                defeatSequence: true, // This triggers the defeat animations
                defeatReason: 'timeout'
              };
            }
            
            // Only update timeRemaining to minimize re-renders
            if (prevState.timeRemaining !== newTimeRemaining) {
              return {
                ...prevState,
                timeRemaining: newTimeRemaining
              };
            }
            
            return prevState; // Return same object reference if no change
          });
        }, 1000); // Update every second

        return {
          ...prev,
          timerActive: true
        };
      }
      return prev;
    });
  }, []);

  const updateGameMetrics = useCallback((updates) => {
    if (typeof updates === 'function') {
      // Support functional updates
      setGameState(prev => ({ ...prev, ...updates(prev) }));
    } else {
      // Support object updates
      setGameState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const resetGame = useCallback(() => {
    // Stop any active timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setGameState({
      level: 1,
      maxLevels: 10,
      catPosition: [4, 1.21, -0.1],
      isMoving: false,
      bridgeCrossed: false,
      isPlaying: false,
      showStartScreen: true,
      victoryType: null,

      hintsUsed: 0,
      gameOver: false,
      showVictoryModal: false,
      showDefeatModal: false,
      wolfyVisible: false,
      defeatSequence: false,
      timeRemaining: GAME_DURATION_MS,
      timerActive: false,
      defeatReason: null
    });
  }, []);

  const checkDefeat = useCallback(() => {
    // Defeat functionality disabled - hints are just hints now
    // This function is kept for compatibility but does nothing
    return;
  }, []);

  const closeModals = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showVictoryModal: false,
      showDefeatModal: false
    }));
  }, []);

  const returnToMenu = useCallback(() => {
    // Stop any active timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setGameState({
      level: 1,
      maxLevels: 10,
      catPosition: [4, 1.21, -0.1],
      isMoving: false,
      bridgeCrossed: false,
      isPlaying: false,
      showStartScreen: true,
      victoryType: null,

      hintsUsed: 0,
      gameOver: false,
      showVictoryModal: false,
      showDefeatModal: false,
      wolfyVisible: false,
      defeatSequence: false,
      timeRemaining: GAME_DURATION_MS,
      timerActive: false,
      defeatReason: null
    });
  }, []);

  const toggleWolfyVisibility = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      wolfyVisible: !prev.wolfyVisible
    }));
  }, []);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Selector hooks for specific state pieces to prevent unnecessary re-renders
  const useWolfState = useCallback(() => ({
    wolfyVisible: gameState.wolfyVisible,
    level: gameState.level,
    defeatSequence: gameState.defeatSequence
  }), [gameState.wolfyVisible, gameState.level, gameState.defeatSequence]);

  const useCatState = useCallback(() => ({
    position: gameState.catPosition,
    isMoving: gameState.isMoving
  }), [gameState.catPosition, gameState.isMoving]);

  const useTimerState = useCallback(() => ({
    timeRemaining: gameState.timeRemaining,
    timerActive: gameState.timerActive
  }), [gameState.timeRemaining, gameState.timerActive]);

  const value = {
    gameState,
    useWolfState,
    useCatState,
    useTimerState,
    moveToNextLevel,
    startGame,
    updateGameMetrics,
    resetGame,
    checkDefeat,
    closeModals,
    returnToMenu,
    toggleWolfyVisibility,
    getMaxHints,
    stopTimer,
    startTimer,
    pauseTimer,
    resumeTimer
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};