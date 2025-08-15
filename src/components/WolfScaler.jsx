import { useMemo, memo } from 'react'

/**
 * WolfScaler component that calculates wolf scale and position based on game level
 * Ensures the wolf grows with each level while preventing ground clipping
 */
function WolfScaler({ children, baseScale = 0.005, basePosition = [-5.5, 3.25, 0], level = 1 }) {
  const wolfTransform = useMemo(() => {
    
    // Calculate scale growth - starts small and grows linearly
    // Level 1: base scale, Level 10: 3x base scale
    const scaleMultiplier = 1 + ((level - 1) * 1.70) // Grows by 25% per level
    const currentScale = Math.max(baseScale * scaleMultiplier, 0.001) // Ensure scale never goes to 0
    
    // No Y offset calculation needed - physics will handle positioning with gravity
    const adjustedPosition = [
      basePosition[0], // X stays the same
      basePosition[1], // Y will be handled by physics/gravity
      basePosition[2] // Z stays the same
    ]
    
    return {
      scale: currentScale,
      position: adjustedPosition,
      level: level
    }
  }, [level, baseScale, basePosition])
  
  // Pass the calculated transform to children
  return children(wolfTransform)
}

export default memo(WolfScaler)
