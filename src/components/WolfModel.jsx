import { useRef, useEffect, useState } from 'react'
import { useFBX, useAnimations } from '@react-three/drei'
import { LoopRepeat } from 'three'
import { useGame } from './GameContext'

function WolfModel({ scale = 0.01, position = [-3.5, 1.1, 0], rotation = [0, 2, 0] }) {
  const group = useRef()
  const { gameState } = useGame()
  const [currentAnimation, setCurrentAnimation] = useState('waving_0') // Start with waving
  
  // Debug logging for wolf model props
  console.log('🐺 WolfModel Props:', { scale, position, rotation })
  
  // Load all animation files
  const idleWolf = useFBX('./wolfModel/idleWolf.fbx')
  const angryWolf = useFBX('./wolfModel/Angry.fbx')
  const wavingWolf = useFBX('./wolfModel/Waving.fbx')
  const defeatedWolf = useFBX('./wolfModel/Defeated.fbx')

  // Create unique animations by renaming them
  const processAnimations = (animations, prefix) => {
    return animations.map((anim, index) => {
      // Clone the animation to avoid modifying the original
      const clonedAnim = anim.clone()
      // Give it a unique name based on the source
      clonedAnim.name = `${prefix}_${index}`
      clonedAnim.sourceType = prefix
      return clonedAnim
    })
  }

  // Process all animations with unique names
  const allAnimations = [
    ...processAnimations(idleWolf.animations, 'idle'),
    ...processAnimations(angryWolf.animations, 'angry'),
    ...processAnimations(wavingWolf.animations, 'waving'),
    ...processAnimations(defeatedWolf.animations, 'defeated')
  ]

  const { actions } = useAnimations(allAnimations, group)

  // Handle animation sequence based on game state
  useEffect(() => {
    if (!Object.keys(actions).length) return;

    let newAnimation = currentAnimation;

    // Animation sequence logic
    if (!gameState.isPlaying) {
      // Start with waving when game hasn't started
      const wavingKey = Object.keys(actions).find(key => key.startsWith('waving_'))
      if (wavingKey) {
        newAnimation = wavingKey
      }
    } else if (gameState.showVictoryModal && gameState.bridgeCrossed) {
      // Show defeated animation before victory modal appears
      const defeatedKey = Object.keys(actions).find(key => key.startsWith('defeated_'))
      if (defeatedKey) {
        newAnimation = defeatedKey
      }
    } else if (gameState.isPlaying && !gameState.showVictoryModal) {
      // Normal gameplay - use idle animation
      const idleKey = Object.keys(actions).find(key => key.startsWith('idle_'))
      if (idleKey) {
        newAnimation = idleKey
      }
    }

    if (newAnimation !== currentAnimation) {
      setCurrentAnimation(newAnimation)
    }
  }, [actions, gameState.isPlaying, gameState.showVictoryModal, gameState.bridgeCrossed, currentAnimation])

  // Auto-transition from waving to idle after game starts
  useEffect(() => {
    if (gameState.isPlaying && currentAnimation?.startsWith('waving_')) {
      const timer = setTimeout(() => {
        const idleKey = Object.keys(actions).find(key => key.startsWith('idle_'))
        if (idleKey) {
          setCurrentAnimation(idleKey)
        }
      }, 3000) // Show waving for 3 seconds after game starts

      return () => clearTimeout(timer)
    }
  }, [gameState.isPlaying, currentAnimation, actions])

  useEffect(() => {
    // Stop all current actions
    Object.keys(actions).forEach(actionName => {
      if (actions[actionName]) {
        actions[actionName].stop()
      }
    })

    // Play the current animation
    if (currentAnimation && actions[currentAnimation]) {
      const action = actions[currentAnimation]
      action.reset().fadeIn(0.3)
      
      // Defeated animation should play once, others loop
      if (currentAnimation.startsWith('defeated_')) {
        action.setLoop(LoopRepeat, 1).play()
      } else {
        action.setLoop(LoopRepeat, Infinity).play()
      }
    }

    return () => {
      // Cleanup
      Object.keys(actions).forEach(actionName => {
        if (actions[actionName]) {
          actions[actionName].stop()
        }
      })
    }
  }, [actions, currentAnimation])

  return (
    <group ref={group}>
      <primitive
        object={idleWolf}
        scale={scale}
        position={position} 
        rotation={rotation}
        castShadow
        receiveShadow
      />
    </group>
  )
}

export default WolfModel 