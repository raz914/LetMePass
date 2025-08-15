import React from 'react'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function CodeBridge({ position = [0, 0, 0], scale = 1 }) {
  const bridgeRef = useRef()

  // Optional: Add subtle animation (swaying effect)
  // useFrame((state) => {
  //   if (bridgeRef.current) {
  //     bridgeRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
  //   }
  // })

  return (
    <group ref={bridgeRef} position={position} scale={scale}>
      {/* Main bridge deck */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 0.2, 1.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Bridge planks - individual wooden boards */}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh
          key={i}
          position={[-3.5 + (i * 0.5), 0.11, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, 0.05, 1.5]} />
          <meshStandardMaterial color="#A0522D" roughness={0.9} />
        </mesh>
      ))}

      {/* Left rope/cable */}
      <mesh position={[0, 0.8, 0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Right rope/cable */}
      <mesh position={[0, 0.8, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Vertical support ropes */}
      {Array.from({ length: 8 }, (_, i) => (
        <React.Fragment key={i}>
          {/* Left side vertical ropes */}
          <mesh position={[-3.5 + (i * 1), 0.4, 0.6]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.8]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>
          {/* Right side vertical ropes */}
          <mesh position={[-3.5 + (i * 1), 0.4, -0.6]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.8]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>
        </React.Fragment>
      ))}

      {/* Bridge posts at the ends */}
      <mesh position={[-4, 0.5, 0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[-4, 0.5, -0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[4, 0.5, 0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[4, 0.5, -0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Horizontal rope rails */}
      <mesh position={[0, 0.8, 0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 8]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[0, 0.8, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 8]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Cross bracing underneath for structural look */}
      {/* <mesh position={[-2, -0.2, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[2, -0.2, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh> */}
    </group>
  )
}

export default CodeBridge