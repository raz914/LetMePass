import { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { LoopRepeat } from 'three'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from './GameContext'

function CatModel({ position = [3, 1.1, -0.9], isMoving = false, targetPosition = null }) {
  const group = useRef()
  const currentPosition = useRef(new THREE.Vector3(...position))
  const targetPos = useRef(new THREE.Vector3(...position))
  const { gameState } = useGame()
  const defeatStartTimeRef = useRef(null)
  const basePositionRef = useRef(null)
  const throwVelocityRef = useRef(new THREE.Vector3())
  const prevDefeatSequenceRef = useRef(false)
  
  // Load the cat model
  const { scene, animations } = useGLTF('./catModel/somali_cat_animated_ver_1.2.glb')
  const { actions } = useAnimations(animations, group)

  // Console log all available animations
  useEffect(() => {
    if (animations.length > 0) {
      console.log('🐱 Available Cat Animations:')
      animations.forEach((animation, index) => {
        console.log(`${index + 1}. ${animation.name} (duration: ${animation.duration.toFixed(2)}s)`)
      })
      console.log('Total animations:', animations.length)
    }
  }, [animations])

  // Update target position when position prop changes
  useEffect(() => {
    if (targetPosition) {
      targetPos.current.set(...targetPosition)
    } else {
      targetPos.current.set(...position)
    }
  }, [position, targetPosition])

  // Initialize defeat sequence parameters when it starts
  useEffect(() => {
    if (gameState?.defeatSequence && group.current) {
      defeatStartTimeRef.current = null // will be set on first frame to clock time
      basePositionRef.current = group.current.position.clone()
      // Choose a throw direction: to the right and slightly back with upward boost
      throwVelocityRef.current.set(3.2, 5.2, 0.8)
    }
  }, [gameState?.defeatSequence])

  // Reset cat rotation when defeat sequence ends (game restarts)
  useEffect(() => {
    const currentDefeatSequence = gameState?.defeatSequence || false
    const prevDefeatSequence = prevDefeatSequenceRef.current
    
    // Only reset rotation when transitioning from defeat sequence to normal state
    if (prevDefeatSequence && !currentDefeatSequence && group.current) {
      // Reset rotation to neutral - the primitive component handles the base orientation
      group.current.rotation.set(0, 0, 0)
      console.log('🐱 Cat rotation reset after defeat sequence')
    }
    
    // Update the previous state ref
    prevDefeatSequenceRef.current = currentDefeatSequence
  }, [gameState?.defeatSequence])

  // Animation control based on movement state
  useEffect(() => {
    if (animations.length === 0) return

    // Find available animations
    const walkAnimation = animations.find(anim => 
      anim.name.toLowerCase().includes('walk') || 
      anim.name.toLowerCase().includes('run') ||
      anim.name.toLowerCase().includes('move')
    )
    
    const idleAnimation = animations.find(anim => 
      anim.name.toLowerCase().includes('idle') || 
      anim.name.toLowerCase().includes('rest') ||
      anim.name.toLowerCase().includes('stand')
    )

    // Stop all current animations
    Object.keys(actions).forEach(actionName => {
      if (actions[actionName]) {
        actions[actionName].fadeOut(0.3)
      }
    })

    // Play appropriate animation
    if (isMoving && walkAnimation) {
      console.log(`🐱 Playing walk animation: ${walkAnimation.name}`)
      actions[walkAnimation.name]
        .reset()
        .fadeIn(0.3)
        .setLoop(LoopRepeat, Infinity)
        .play()
    } else if (!isMoving && idleAnimation) {
      console.log(`🐱 Playing idle animation: ${idleAnimation.name}`)
      actions[idleAnimation.name]
        .reset()
        .fadeIn(0.3)
        .setLoop(LoopRepeat, Infinity)
        .play()
    } else {
      // Fallback to first animation
      const fallbackAnimation = animations[0]
      if (fallbackAnimation && actions[fallbackAnimation.name]) {
        console.log(`🐱 Playing fallback animation: ${fallbackAnimation.name}`)
        actions[fallbackAnimation.name]
          .reset()
          .fadeIn(0.3)
          .setLoop(LoopRepeat, Infinity)
          .play()
      }
    }

    return () => {
      // Cleanup on unmount
      Object.keys(actions).forEach(actionName => {
        if (actions[actionName]) {
          actions[actionName].stop()
        }
      })
    }
  }, [actions, animations, isMoving])

  // Movement and defeat sequence animation
  useFrame((state, delta) => {
    if (!group.current) return

    // Defeat cinematic overrides normal movement
    if (gameState?.defeatSequence) {
      // Lazily set start time in seconds
      if (defeatStartTimeRef.current === null) {
        defeatStartTimeRef.current = state.clock.getElapsedTime()
      }
      const start = defeatStartTimeRef.current
      const elapsed = state.clock.getElapsedTime() - start

      // Phase 1: levitate up for ~1.0s
      if (elapsed <= 1.0) {
        const t = Math.min(1, elapsed / 1.0)
        const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)
        const lift = easeOutCubic(t) * 1.5
        const base = basePositionRef.current || currentPosition.current
        group.current.position.set(base.x, base.y + lift, base.z)
        // subtle shake/anticipation
        group.current.rotation.z = Math.sin(elapsed * 10) * 0.1
        return
      }

      // Phase 2: throw with gravity for the next ~1.6s
      const dt = delta
      const velocity = throwVelocityRef.current
      // integrate simple kinematics
      group.current.position.x += velocity.x * dt
      group.current.position.y += velocity.y * dt
      group.current.position.z += velocity.z * dt
      // gravity
      velocity.y += -9.81 * 0.85 * dt
      // spin while flying
      group.current.rotation.x += 2.3 * dt
      group.current.rotation.y += 1.6 * dt
      group.current.rotation.z += 3.1 * dt
      return
    }

    // Normal smooth movement
    const lerpFactor = delta * 2
    currentPosition.current.lerp(targetPos.current, lerpFactor)
    group.current.position.copy(currentPosition.current)
  })

  return (
    <group ref={group}>
      <primitive
        object={scene}
        scale={0.1}
        rotation={[0, Math.PI / 2.1, 0]}
        castShadow
        receiveShadow
      />
    </group>
  )
}

// Preload the model
useGLTF.preload('./catModel/somali_cat_animated_ver_1.2.glb')

export default CatModel 