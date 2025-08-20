import { useRef, useEffect } from 'react'
import { useGLTF, useAnimations, useTexture } from '@react-three/drei'
import { LoopRepeat } from 'three'

function WolfMedModel({ scale = 0.005, position = [0, -0.05, 0], rotation = [0, 0, 0], visible = false }) {
  const group = useRef()
  
  // Load GLB model and texture
  const wolfMed = useGLTF('./wolfModel/wolfMed.glb')
  const wolfMedTexture = useTexture('./wolfModel/wolfMed.png')
  
  // Set up animations
  const { actions } = useAnimations(wolfMed.animations, group)

  // Apply texture to model
  useEffect(() => {
    if (wolfMed.scene && wolfMedTexture) {
      wolfMed.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          // If the material is an array, apply to all materials
          if (Array.isArray(child.material)) {
            child.material.forEach(material => {
              material.map = wolfMedTexture
              material.needsUpdate = true
            })
          } else {
            // Single material
            child.material.map = wolfMedTexture
            child.material.needsUpdate = true
          }
        }
      })
    }
  }, [wolfMed.scene, wolfMedTexture])

  // Play default animation on loop
  useEffect(() => {
    const animationNames = Object.keys(actions)
    console.log('🐺 WolfMed animations available:', animationNames)
    
    if (animationNames.length > 0 && visible) {
      // Use the first available animation (default)
      const defaultAnimation = animationNames[0]
      console.log('🐺 Playing WolfMed animation:', defaultAnimation)
      
      // Stop all actions first
      Object.values(actions).forEach(action => action?.stop())
      
      // Play the default animation
      if (actions[defaultAnimation]) {
        actions[defaultAnimation]
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
        object={wolfMed.scene}
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

export default WolfMedModel
