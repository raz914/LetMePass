import React, { memo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Physics } from '@react-three/cannon'
import WolfModel from './WolfModel'
import PhysicsWolf from './PhysicsWolf'
import WolfScaler from './WolfScaler'
import WolfGround from './WolfGround'
import CatModel from './CatModel'
import CodeBridge from './CodeBridge'
import { useGame } from './GameContext'

function GandalfModel() {
  const { scene } = useGLTF('/forGandalf.glb')

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, -1, 0]}
      castShadow
      receiveShadow
    />
  )
}

// Memoized wolf section to prevent unnecessary re-renders
const WolfSection = memo(({ wolfyVisible, level, defeatSequence }) => {
  if (!wolfyVisible) return null;
  
  return (
    <Physics gravity={[0, -9.82, 0]} iterations={5}>
      <WolfScaler level={level}>
        {(wolfTransform) => (
          <>
            <PhysicsWolf 
              scale={wolfTransform.scale}
              position={wolfTransform.position}
              defeatSequence={defeatSequence}
            />
            <WolfGround position={[-5.5, 1.1, 0]} />
          </>
        )}
      </WolfScaler>
    </Physics>
  );
});

function Scene() {
  const { useWolfState, useCatState } = useGame()
  const wolfState = useWolfState()
  const catState = useCatState()

  return (
    <group>
      {/* Main Gandalf Model (Bridge) */}
      <GandalfModel />

      {/* Code-based Bridge - positioned to the side for comparison */}
      <CodeBridge 
        position={[0, 0.9, 0]} 
        scale={1}
      />

      {/* Physics-enabled Wolf with Gravity and Ground Collider - Only show when spawned */}
      <WolfSection 
        wolfyVisible={wolfState.wolfyVisible}
        level={wolfState.level}
        defeatSequence={wolfState.defeatSequence}
      />

      {/* Cat Model with Level Progression */}
      <CatModel 
        position={catState.position}
        isMoving={catState.isMoving}
        targetPosition={catState.position}
      />

      {/* Ground Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.5, 0]}
        receiveShadow
      >
        {/* <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f8f9fa" /> */}
      </mesh>
    </group>
  )
}

export default Scene 