import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGame } from './GameContext'
import * as THREE from 'three'

function CameraFollow({ orbitControlsRef }) {
  const { camera } = useThree()
  const { gameState } = useGame()
  const lastCatPosition = useRef(new THREE.Vector3())
  const targetCameraPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const isFollowing = useRef(false)
  const followStartTime = useRef(0)

  // Camera offset behind the cat (adjust these values as needed)
  const CAMERA_OFFSET = new THREE.Vector3(4, 2, 2) // Behind, above, and to the side
  const FOLLOW_DURATION = 2000 // 2 seconds to follow
  const LERP_SPEED = 3 // How fast camera moves

  useEffect(() => {
    const currentCatPos = new THREE.Vector3(...gameState.catPosition)
    
    // Check if cat has moved significantly
    if (lastCatPosition.current.distanceTo(currentCatPos) > 0.1) {
      console.log('🎥 Cat moved, starting camera follow')
      isFollowing.current = true
      followStartTime.current = Date.now()
      
      // Calculate target camera position (behind the cat)
      targetCameraPosition.current.copy(currentCatPos)
      targetCameraPosition.current.add(CAMERA_OFFSET)
      
      // Target to look at the cat
      targetLookAt.current.copy(currentCatPos)
      
      lastCatPosition.current.copy(currentCatPos)
    }
  }, [gameState.catPosition])

  useFrame((state, delta) => {
    if (!isFollowing.current || !orbitControlsRef?.current) return

    const elapsed = Date.now() - followStartTime.current
    
    if (elapsed < FOLLOW_DURATION) {
      // Smoothly move camera to follow position
      const lerpFactor = delta * LERP_SPEED
      
      // Update camera position
      camera.position.lerp(targetCameraPosition.current, lerpFactor)
      
      // Update orbit controls target to look at cat
      if (orbitControlsRef.current.target) {
        orbitControlsRef.current.target.lerp(targetLookAt.current, lerpFactor)
        orbitControlsRef.current.update()
      }
    } else {
      // Stop following after duration
      isFollowing.current = false
      console.log('🎥 Camera follow completed')
    }
  })

  return null
}

export default CameraFollow
