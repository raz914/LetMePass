import { usePlane } from '@react-three/cannon'

/**
 * Invisible ground collider component specifically for the wolf
 * Positioned beneath the wolf to catch it when it falls due to gravity
 */
function WolfGround({ position = [-5.5, 1.5, 0] }) {
  // Create an invisible plane that acts as ground for the wolf
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], // Horizontal plane
    position: position, // Position it beneath the wolf
    material: {
      friction: 0.9, // High friction to prevent sliding
      restitution: 0.1 // Low bounce
    }
  }))

  return (
    <mesh ref={ref} visible={false}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial />
    </mesh>
  )
}

export default WolfGround
