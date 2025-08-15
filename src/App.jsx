import { useState, useRef } from 'react'
import ThreeScene from './components/ThreeScene'
import NPCChat from './components/NPCChat'
import LoadingScreen from './components/LoadingScreen'
import StartScreen from './components/StartScreen'
import AudioControls from './components/AudioControls'
import { GameProvider, useGame } from './components/GameContext'

function GameContent() {
  const { gameState, startGame } = useGame()
  const [isLoading, setIsLoading] = useState(true)
  const npcChatRef = useRef(null)

  const handleLoadComplete = () => {
    console.log('🎮 Game assets loaded, transitioning to start screen...')
    setIsLoading(false)
  }

  const handleStartGame = () => {
    // Call the NPCChat's startGameWithWolfy function to auto-spawn Wolfy
    if (npcChatRef.current && npcChatRef.current.startGameWithWolfy) {
      npcChatRef.current.startGameWithWolfy()
    } else {
      // Fallback to regular startGame if NPCChat ref is not available
      startGame()
    }
  }

  return (
    <>
      {/* Loading Screen - Shows before game loads */}
      {isLoading && <LoadingScreen onLoadComplete={handleLoadComplete} />}
      
      {/* Start Screen - Shows after loading, before game starts */}
      {!isLoading && gameState.showStartScreen && (
        <StartScreen onStartGame={handleStartGame} />
      )}
      
      {/* Main Game Interface - Shows after start screen */}
      <div className={`w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col md:flex-row transition-opacity duration-500 ${
        isLoading || gameState.showStartScreen ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        {/* Main 3D Scene - Always render in background for smooth transition */}
        <div className="flex-1 relative md:h-full h-2/5">
          <ThreeScene onLoadComplete={handleLoadComplete} />
          
          {/* Audio Controls - Only show during gameplay */}
          {gameState.isPlaying && <AudioControls />}
        </div>

        {/* NPC Chat Panel - Bottom on mobile, side on desktop */}
        <div className="w-full md:w-96 h-3/5 md:h-full overflow-hidden">
          <NPCChat ref={npcChatRef} />
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}

export default App
