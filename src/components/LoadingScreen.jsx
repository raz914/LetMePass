import React, { useState, useEffect } from 'react'
import { Html, useProgress } from '@react-three/drei'

function LoadingScreen({ onLoadComplete }) {
  const { progress, active, loaded, total, errors } = useProgress()
  const [displayProgress, setDisplayProgress] = useState(0)
  const [loadingMessages, setLoadingMessages] = useState([])

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress)
    }, 50)
    return () => clearTimeout(timer)
  }, [progress])

  // Update loading messages based on progress
  useEffect(() => {
    const messages = []
    
    if (progress > 0) messages.push('🌅 Approaching the mystical bridge...')
    if (progress > 20) messages.push('🐺 Wolfy is preparing his riddles...')
    if (progress > 40) messages.push('🐱 The clever cat stretches and prepares...')
    if (progress > 60) messages.push('🌉 The ancient bridge awakens...')
    if (progress > 80) messages.push('💧 The stream below whispers secrets...')
    if (progress >= 100) messages.push('✨ The path is ready... Let me pass!')

    setLoadingMessages(messages)
  }, [progress])

  // Notify parent when loading is complete
  useEffect(() => {
    if (!active && progress >= 100) {
      const timer = setTimeout(() => {
        onLoadComplete?.()
      }, 1000) // Small delay for smooth transition
      return () => clearTimeout(timer)
    }
  }, [active, progress, onLoadComplete])

  if (!active && progress >= 100) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sky-200 via-green-100 to-emerald-200 flex items-center justify-center z-50">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Game Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-emerald-800 mb-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 bg-clip-text text-transparent">
            Let Me Pass
          </h1>
          <p className="text-emerald-700 text-lg font-medium">
            🌉 A Bridge Crossing Adventure
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="mb-6">
          <div className="bg-emerald-800/20 rounded-full h-4 backdrop-blur-sm border border-emerald-600/40 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-400 via-emerald-500 to-green-600 h-full rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${displayProgress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
            </div>
          </div>
          
          {/* Progress Text */}
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-emerald-700">
              {loaded} / {total} assets
            </span>
            <span className="text-emerald-800 font-semibold">
              {Math.round(displayProgress)}%
            </span>
          </div>
        </div>

        {/* Loading Messages */}
        <div className="space-y-2 min-h-[120px]">
          {loadingMessages.map((message, index) => (
            <div
              key={index}
              className={`text-emerald-800 transition-all duration-500 ${
                index === loadingMessages.length - 1 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-60 scale-95'
              }`}
            >
              {message}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-800/30 border border-red-600/50 rounded-lg backdrop-blur-sm">
            <p className="text-red-700 text-sm">
              ⚠️ Some assets failed to load ({errors.length} errors)
            </p>
          </div>
        )}

        {/* Spinning Animation */}
        <div className="mt-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>

        {/* Fun Loading Tip */}
        <div className="mt-6 text-xs text-emerald-700/80 italic">
          🌉 Tip: Help the cat cross the bridge by solving Wolfy's riddles!
        </div>
      </div>
    </div>
  )
}

// Loading screen for use inside Canvas (for Three.js context)
export function CanvasLoadingScreen({ onLoadComplete }) {
  const { progress, active } = useProgress()

  useEffect(() => {
    if (!active && progress >= 100) {
      onLoadComplete?.()
    }
  }, [active, progress, onLoadComplete])

  if (!active && progress >= 100) {
    return null
  }

  return (
    <Html center>
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading 3D Assets... {Math.round(progress)}%</p>
      </div>
    </Html>
  )
}

export default LoadingScreen
