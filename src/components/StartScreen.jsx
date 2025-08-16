import React, { useState, useEffect } from 'react'
import Settings from './Settings'
import soundManager from '../services/soundManager'
import Player2ApiCheck from './Player2ApiCheck'
import { checkApiAvailability } from '../services/apiCheck'
import Toast from './Toast'

function StartScreen({ onStartGame }) {
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showApiCheck, setShowApiCheck] = useState(false)
  const [isApiAvailable, setIsApiAvailable] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Start background music when start screen loads
  useEffect(() => {
    const startMusic = async () => {
      try {
        // Small delay to ensure audio context is ready
        setTimeout(() => {
          soundManager.playBackgroundMusic()
        }, 100)
      } catch (error) {
        console.log('Failed to start background music:', error)
      }
    }

    startMusic()
    
    // Check Player2 API availability
    const checkApi = async () => {
      const available = await checkApiAvailability()
      setIsApiAvailable(available)
      
      // If API is available, show toast; otherwise show modal
      if (available) {
        setShowToast(true)
      } else {
        setShowApiCheck(true)
      }
    }
    
    checkApi()
  }, [])

  const handlePlayClick = () => {
    // Play click sound when starting game
    soundManager.playClickSound()
    
    // If API is not available, show the check modal
    if (!isApiAvailable) {
      setShowApiCheck(true)
      return
    }
    
    onStartGame()
  }
  
  const handleApiCheckClose = (apiAvailable) => {
    setIsApiAvailable(apiAvailable)
    setShowApiCheck(false)
  }

  const HowToPlayModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl max-w-2xl w-full max-h-[90vh] border-2 border-emerald-300 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">🎮 How to Play</h2>
          <button 
            onClick={() => { soundManager.playClickSound(); setShowHowToPlay(false) }}
            className="text-emerald-600 hover:text-emerald-800 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="px-6 overflow-y-auto flex-1">
          <div className="space-y-4 text-emerald-700 pb-4">
          <div className="bg-emerald-100 p-4 rounded-lg border border-emerald-200">
            <h3 className="font-bold text-lg mb-2">🌉 Your Mission</h3>
            <p>Help the clever cat cross the ancient bridge by solving Wolfy's riddles!</p>
          </div>
          
          <div className="bg-teal-100 p-4 rounded-lg border border-teal-200">
            <h3 className="font-bold text-lg mb-2">🐺 The Challenge</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Answer Wolfy's riddles correctly to advance</li>
              <li>Each correct answer moves you one step closer to victory</li>
              <li>Complete all 10 levels to reach the other side</li>
            </ul>
          </div>
          
          <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-lg mb-2">⏰ Time Pressure</h3>
            <p>You have 5 minutes to cross the entire bridge - use your time wisely!</p>
          </div>
          
          <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-bold text-lg mb-2">💡 Hints</h3>
            <p>You can use up to 3 hints throughout the entire game to help you solve difficult riddles.</p>
          </div>
          
          <div className="bg-purple-100 p-4 rounded-lg border border-purple-200">
            <h3 className="font-bold text-lg mb-2">🎯 Tips for Success</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Read each riddle carefully</li>
              <li>Think outside the box - some answers are wordplay!</li>
              <li>Use hints strategically on the hardest riddles</li>
              <li>Don't rush - accuracy is more important than speed</li>
            </ul>
          </div>
          </div>
        </div>
        
        <div className="p-6 pt-4 text-center flex-shrink-0 border-t border-emerald-200">
          <button 
            onClick={() => { soundManager.playClickSound(); setShowHowToPlay(false) }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Got it! Let's Play 🚀
          </button>
        </div>
      </div>
    </div>
  )

  const AboutModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl max-w-2xl w-full max-h-[90vh] border-2 border-sky-300 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl md:text-3xl font-bold text-sky-800">📚 About Let Me Pass</h2>
          <button 
            onClick={() => { soundManager.playClickSound(); setShowAbout(false) }}
            className="text-sky-600 hover:text-sky-800 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="px-6 overflow-y-auto flex-1">
          <div className="space-y-4 text-sky-700 pb-4">
          <div className="bg-sky-100 p-4 rounded-lg border border-sky-200">
            <h3 className="font-bold text-lg mb-2">🌉 The Story</h3>
            <p>
              In the mystical realm where ancient bridges connect distant lands, 
              a clever cat encounters Wolfy, the guardian of an enchanted crossing. 
              This isn't just any bridge - it's a test of wit, wisdom, and quick thinking!
            </p>
          </div>
          
          <div className="bg-indigo-100 p-4 rounded-lg border border-indigo-200">
            <h3 className="font-bold text-lg mb-2">🎮 Game Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>10 challenging words with unique riddles</li>
              <li>Beautiful 3D environment and characters</li>
              <li>Real-time timer adding excitement</li>
              <li>Hint system to help when you're stuck</li>
              <li>Immersive bridge-crossing adventure</li>
            </ul>
          </div>
          
          <div className="bg-purple-100 p-4 rounded-lg border border-purple-200">
            <h3 className="font-bold text-lg mb-2">🏆 Victory Conditions</h3>
            <p>
              Successfully answer all of Wolfy's riddles within the time limit to help 
              the cat safely cross the bridge and reach the other side!
            </p>
          </div>
          
          <div className="bg-emerald-100 p-4 rounded-lg border border-emerald-200">
            <h3 className="font-bold text-lg mb-2">✨ Made With</h3>
            <p>
              Crafted with React, Three.js, and lots of imagination. 
              A delightful blend of puzzle-solving and adventure!
            </p>
          </div>
          </div>
        </div>
        
        <div className="p-6 pt-4 text-center flex-shrink-0 border-t border-sky-200">
          <button 
            onClick={() => { soundManager.playClickSound(); setShowAbout(false) }}
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Ready to Adventure! 🌟
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-sky-200 via-emerald-100 to-teal-200 flex items-center justify-center z-40">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 text-6xl opacity-20 animate-bounce">🌉</div>
          <div className="absolute top-40 right-32 text-4xl opacity-30 animate-pulse">🐺</div>
          <div className="absolute bottom-32 left-32 text-5xl opacity-25 animate-bounce delay-1000">🐱</div>
          <div className="absolute bottom-20 right-20 text-3xl opacity-20 animate-pulse delay-500">✨</div>
          <div className="absolute top-1/2 left-10 text-4xl opacity-15 animate-bounce delay-700">🌊</div>
          <div className="absolute top-1/3 right-10 text-3xl opacity-25 animate-pulse delay-300">🌙</div>
        </div>

        <div className="text-center max-w-md mx-auto px-6 relative z-10">
          {/* Game Title */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold text-emerald-800 mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 bg-clip-text text-transparent drop-shadow-lg">
              Let Me Pass
            </h1>
            <p className="text-emerald-700 text-xl font-medium mb-2">
              🌉 A Bridge Crossing Adventure
            </p>
            <p className="text-emerald-600 text-sm italic">
              Help the clever cat solve Wolfy's riddles!
            </p>
          </div>

          {/* Menu Buttons */}
          <div className="space-y-4">
            <button
              onClick={handlePlayClick}
              className={`w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xl font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border-2 border-emerald-300 ${!isApiAvailable ? 'opacity-50 filter blur-[1px] cursor-not-allowed' : ''}`}
            >
              🎮 PLAY GAME
            </button>
            
            <button
              onClick={() => { soundManager.playClickSound(); setShowHowToPlay(true) }}
              className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white text-lg font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-sky-300"
            >
              📖 How to Play
            </button>
            
            <button
              onClick={() => { soundManager.playClickSound(); setShowAbout(true) }}
              className="w-full bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white text-lg font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-purple-300"
            >
              ℹ️ About
            </button>
            
            <button
              onClick={() => { soundManager.playClickSound(); setShowSettings(true) }}
              className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white text-lg font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-orange-300"
            >
              ⚙️ Settings
            </button>
          </div>

          {/* Fun subtitle */}
          <div className="mt-8 text-emerald-700/80 text-sm italic">
            🌟 The bridge awaits your wisdom!
          </div>
        </div>
      </div>

      {/* Modals */}
      {showHowToPlay && <HowToPlayModal />}
      {showAbout && <AboutModal />}
      <Settings isVisible={showSettings} onClose={() => setShowSettings(false)} />
      <Player2ApiCheck isVisible={showApiCheck} onClose={handleApiCheckClose} />
      {showToast && (
        <Toast 
          message="Player2 API connected successfully!" 
          type="success" 
          onClose={() => setShowToast(false)} 
        />
      )}
    </>
  )
}

export default StartScreen
