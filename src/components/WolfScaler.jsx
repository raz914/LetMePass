import { useMemo, memo } from 'react'

/**
 * WolfScaler component that calculates wolf scale and position based on game level
 * Ensures the wolf grows with each level while preventing ground clipping
 */
function WolfScaler({ children, baseScale = 0.005, basePosition = [-5.5, 3.25, 0], level = 1 }) {
  const wolfTransform = useMemo(() => {
    
    // Calculate scale growth - starts small and grows linearly
    // Level 1-2: default size
    // Level 3-6: 3x original size
    // Level 7+: 6x original size
    let scaleMultiplier;
    if (level >= 7) {
      scaleMultiplier = 4.5;
    } else if (level >= 3) {
      scaleMultiplier = 3;
    } else {
      scaleMultiplier = 1; // Default size for levels 1-2
    }

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
