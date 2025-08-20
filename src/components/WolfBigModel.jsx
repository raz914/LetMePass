import { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { LoopRepeat } from 'three'

function WolfBigModel({ scale = 0.005, position = [-1.3, 1.7, 0], rotation = [0, -3, 0], visible = false }) {
  const group = useRef()
  
  // Load GLB model
  const wolfBig = useGLTF('./wolfModel/wolfBig.glb')
  
  // Set up animations
  const { actions } = useAnimations(wolfBig.animations, group)

  // Play idle animation on loop
  useEffect(() => {
    const animationNames = Object.keys(actions)
    console.log('🐺 WolfBig animations available:', animationNames)
    
    if (visible && animationNames.length > 0) {
      // Look for idle animation specifically, or use first available
      let idleAnimation = animationNames.find(name => 
        name.toLowerCase().includes('idle')
      )
      
      // If no idle animation found, use the first available
      if (!idleAnimation) {
        idleAnimation = animationNames[0]
      }
      
      console.log('🐺 Playing WolfBig animation:', idleAnimation)
      
      // Stop all actions first
      Object.values(actions).forEach(action => action?.stop())
      
      // Play the idle animation
      if (actions[idleAnimation]) {
        actions[idleAnimation]
          .reset()
          .fadeIn(0.3)
          .setLoop(LoopRepeat, Infinity)
          .play()
      }
    } else if (!visible) {
      // Stop all animations when not visible
      Object.values(actions).forEach(action => action?.stop())
    }

    return () => {
      // Cleanup
      Object.values(actions).forEach(action => action?.stop())
    }
  }, [actions, visible])

  return (
    <group ref={group}>
      <primitive
        object={wolfBig.scene}
        scale={scale}
        position={position}
        rotation={rotation}
        visible={visible}
        castShadow
        receiveShadow
      />
    </group>
  )
}

export default WolfBigModel
