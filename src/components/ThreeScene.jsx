import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { useRef, Suspense } from 'react'
// import { useFrame, useThree } from '@react-three/fiber' // For camera logging
import Scene from './Scene'
import CameraFollow from './CameraFollow'
import { CanvasLoadingScreen } from './LoadingScreen'

/*
// Camera Logging Component - Uncomment to enable position tracking
function CameraLogger() {
  const { camera } = useThree()
  const controlsRef = useRef()
  const lastPosition = useRef({ x: 0, y: 0, z: 0 })
  
  const logCameraInfo = () => {
    const pos = camera.position
    const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z)
    const polarAngle = Math.acos(pos.y / distance)
    const azimuthAngle = Math.atan2(pos.x, pos.z)
    
    console.log('📷 Camera Info:')
    console.log('Position:', {
      x: pos.x.toFixed(2),
      y: pos.y.toFixed(2),
      z: pos.z.toFixed(2)
    })
    console.log('Distance from target:', distance.toFixed(2))
    console.log('Polar angle (radians):', polarAngle.toFixed(2))
    console.log('Azimuth angle (radians):', azimuthAngle.toFixed(2))
    console.log('For initial camera position use: { position: [' + 
      pos.x.toFixed(2) + ', ' + pos.y.toFixed(2) + ', ' + pos.z.toFixed(2) + '] }')
    console.log('---')
  }

  useFrame(() => {
    const pos = camera.position
    const threshold = 0.1
    
    // Only log when camera position changes significantly
    if (Math.abs(pos.x - lastPosition.current.x) > threshold ||
        Math.abs(pos.y - lastPosition.current.y) > threshold ||
        Math.abs(pos.z - lastPosition.current.z) > threshold) {
      
      logCameraInfo()
      lastPosition.current = { x: pos.x, y: pos.y, z: pos.z }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2}
      target={[0, 0, 0]}
      onChange={logCameraInfo}
    />
  )
}
*/

function ThreeScene({ onLoadComplete }) {
  const orbitControlsRef = useRef()

  return (
    <Canvas
      camera={{ position: [4.48, 2.65, -4.36], fov: 50 }}
      shadows
      className="w-full h-full"
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        angle={0.15}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* 3D Scene with Suspense for loading */}
      <Suspense fallback={<CanvasLoadingScreen onLoadComplete={onLoadComplete} />}>
        <Scene />
      </Suspense>

      {/* Environment and Shadows */}
      <Environment files="./scene.hdr" />
      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.75}
        scale={10}
        blur={2.5}
        far={4}
      />

      {/* Camera Controls */}
      <OrbitControls
        ref={orbitControlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 0]}
      />

      {/* Camera Follow System */}
      <CameraFollow orbitControlsRef={orbitControlsRef} />
    </Canvas>
  )
}

export default ThreeScene 