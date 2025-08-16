import { useRef, useEffect, useState, memo } from 'react'
import { useFBX, useAnimations } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
import { LoopRepeat } from 'three'

/**
 * Physics-enabled Wolf component that uses gravity and colliders
 * instead of manual Y position calculations
 */
function PhysicsWolf({ scale = 0.005, position = [-5.5, 3, 0], defeatSequence = false }) {
  const group = useRef()
  const [currentAnimation, setCurrentAnimation] = useState('idle_1')
  
  // Physics body for the wolf - using a box collider
  const [ref, api] = useBox(() => ({
    mass: 1, // Give it mass so gravity affects it
    position: position, // Starting position (higher up so it falls)
    args: [0.5, 0.5, 0.5], // Collider size
  }))
  
  // Load all animation files
  const idleWolf = useFBX('./wolfModel/idleWolf.fbx')
  const angryWolf = useFBX('./wolfModel/Angry.fbx')
  const wavingWolf = useFBX('./wolfModel/Waving.fbx')

  // Create unique animations by renaming them
  const processAnimations = (animations, prefix) => {
    return animations.map((anim, index) => {
      const clonedAnim = anim.clone()
      clonedAnim.name = `${prefix}_${index}`
      clonedAnim.sourceType = prefix
      return clonedAnim
    })
  }

  // Process all animations with unique names
  const allAnimations = [
    ...processAnimations(idleWolf.animations, 'idle'),
    ...processAnimations(angryWolf.animations, 'angry'),
    ...processAnimations(wavingWolf.animations, 'waving')
  ]

  const { actions } = useAnimations(allAnimations, group)

  // Set default animation to idle
  useEffect(() => {
    const idleAnimationKey = Object.keys(actions).find(key => key.startsWith('idle_'))
    if (idleAnimationKey && !currentAnimation) {
      setCurrentAnimation(idleAnimationKey)
    }
  }, [actions, currentAnimation])

  // Switch to angry animation during defeat sequence
  useEffect(() => {
    if (!actions) return
    if (defeatSequence) {
      const angryKey = Object.keys(actions).find(key => key.startsWith('angry_'))
      if (angryKey) setCurrentAnimation(angryKey)
    }
  }, [actions, defeatSequence])

  useEffect(() => {
    // Stop all current actions
    Object.keys(actions).forEach(actionName => {
      if (actions[actionName]) {
        actions[actionName].stop()
      }
    })

    // Play the current animation (default: idle)
    if (currentAnimation && actions[currentAnimation]) {
      actions[currentAnimation]
        .reset()
        .fadeIn(0.3)
        .setLoop(LoopRepeat, Infinity)
        .play()
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

  // Debug: This should only log when props actually change, not every second
  console.log('🐺 PhysicsWolf render - Scale:', scale, 'DefeatSequence:', defeatSequence);

  return (
    <group ref={ref}>
      <group ref={group}>
        <primitive
          object={idleWolf}
          scale={scale}
          rotation={[0, 2, 0]}
          castShadow
          receiveShadow
        />
      </group>
    </group>
  )
}

export default memo(PhysicsWolf, (prevProps, nextProps) => {
  // Only re-render if scale, position, or defeatSequence actually changed
  return (
    prevProps.scale === nextProps.scale &&
    prevProps.position[0] === nextProps.position[0] &&
    prevProps.position[1] === nextProps.position[1] &&
    prevProps.position[2] === nextProps.position[2] &&
    prevProps.defeatSequence === nextProps.defeatSequence
  )
})
