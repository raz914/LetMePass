import { useRef, useEffect, useState, memo } from 'react'
import { useFBX, useAnimations } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
import { LoopRepeat } from 'three'
import WolfMedModel from './WolfMedModel'
import WolfBigModel from './WolfBigModel'

/**
 * Physics-enabled Wolf component that uses gravity and colliders
 * instead of manual Y position calculations
 */
function PhysicsWolf({ scale = 0.005, position = [-5.5, 3, 0], defeatSequence = false, level = 1 }) {
  const group = useRef()
  const [currentAnimation, setCurrentAnimation] = useState(null) // Will be set based on level
  
  // Physics body for the wolf - using a box collider
  const [ref, api] = useBox(() => ({
    mass: 1, // Give it mass so gravity affects it
    position: position, // Starting position (higher up so it falls)
    args: [0.5, 0.5, 0.5], // Collider size
  }))
  
  // Load all animation files (FBX format)
  const idleWolf = useFBX('./wolfModel/idleWolf.fbx')
  const angryWolf = useFBX('./wolfModel/Angry.fbx')
  const wavingWolf = useFBX('./wolfModel/Waving.fbx')
  const oldManIdleWolf = useFBX('./wolfModel/OldManIdle.fbx')
  const happyIdleWolf = useFBX('./wolfModel/HappyIdle.fbx')



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
    ...processAnimations(wavingWolf.animations, 'waving'),
    ...processAnimations(oldManIdleWolf.animations, 'oldmanidle'),
    ...processAnimations(happyIdleWolf.animations, 'happyidle')
  ]

  const { actions } = useAnimations(allAnimations, group)

  // Set animation based on level
  useEffect(() => {
    if (!Object.keys(actions).length) return;

    let targetAnimation = null;

    // During defeat sequence, always use angry
    if (defeatSequence) {
      const angryKey = Object.keys(actions).find(key => key.startsWith('angry_'))
      if (angryKey) targetAnimation = angryKey;
    } else {
      // Level-based animations
      if (level >= 7) {
        // Level 7+: Use angry animation
        const angryKey = Object.keys(actions).find(key => key.startsWith('angry_'))
        if (angryKey) targetAnimation = angryKey;
      } else if (level >= 3) {
        // Level 3-6: Use happy idle animation
        const happyIdleKey = Object.keys(actions).find(key => key.startsWith('happyidle_'))
        if (happyIdleKey) targetAnimation = happyIdleKey;
      } else {
        // Level 1-2: Use old man idle animation
        const oldManIdleKey = Object.keys(actions).find(key => key.startsWith('oldmanidle_'))
        if (oldManIdleKey) targetAnimation = oldManIdleKey;
      }
    }

    if (targetAnimation && targetAnimation !== currentAnimation) {
      setCurrentAnimation(targetAnimation);
    }
  }, [actions, level, defeatSequence, currentAnimation])

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

  // Determine which model should be visible based on level
  const getModelVisibility = (level) => {
    return {
      originalVisible: level >= 1 && level <= 2,   // Levels 1-2: Original FBX model
      mediumVisible: level >= 3 && level <= 6,     // Levels 3-6: Medium GLB model  
      bigVisible: level >= 7                       // Levels 7+: Big GLB model
    }
  }

  const { originalVisible, mediumVisible, bigVisible } = getModelVisibility(level)

  // Debug: This should only log when props actually change, not every second
  console.log('🐺 PhysicsWolf render - Scale:', scale, 'Level:', level, 'DefeatSequence:', defeatSequence, 'Animation:', currentAnimation);
  console.log('🐺 Model Visibility - Original:', originalVisible, 'Medium:', mediumVisible, 'Big:', bigVisible);

  return (
    <group ref={ref}>
      <group ref={group}>
        {/* Original FBX model - small size (levels 1-2) */}
        <primitive
          object={idleWolf}
          scale={scale} // Keep original small scale
          position={[0, 0, 0]} // Default position
          rotation={[0, 2, 0]}
          visible={originalVisible}
          castShadow
          receiveShadow
        />
        
        {/* Medium GLB model - medium size (levels 3-6) */}
        <WolfMedModel
          scale={scale * 0.4}
          position={[0, -0.05, 0]}
          rotation={[0, 0, 0]}
          visible={mediumVisible}
        />
        
        {/* Big GLB model - large size (levels 7+) */}
        <WolfBigModel
          scale={scale * 60}
          position={[-1, 1, 0]}
          rotation={[0, -3, 0]}
          visible={bigVisible}
        />
      </group>
    </group>
  )
}

export default memo(PhysicsWolf, (prevProps, nextProps) => {
  // Only re-render if scale, position, defeatSequence, or level actually changed
  return (
    prevProps.scale === nextProps.scale &&
    prevProps.position[0] === nextProps.position[0] &&
    prevProps.position[1] === nextProps.position[1] &&
    prevProps.position[2] === nextProps.position[2] &&
    prevProps.defeatSequence === nextProps.defeatSequence &&
    prevProps.level === nextProps.level
  )
})
