import { Sparkles } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

// The strain orange from src/styles.css (--color-strain).
const ORANGE = '#E8A055'

// Loaded lazily by SparklesBackground (the "-" prefix keeps it out of the route tree).
export default function SparklesScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: 'transparent', pointerEvents: 'none' }}
    >
      {/* Three layers of sizes; ~40 particles total, slow and soft. */}
      <Sparkles count={22} scale={[10, 9, 4]} size={2} speed={0.2} opacity={0.55} color={ORANGE} />
      <Sparkles count={12} scale={[10, 9, 4]} size={4} speed={0.15} opacity={0.45} color={ORANGE} />
      <Sparkles count={6} scale={[10, 9, 4]} size={7} speed={0.1} opacity={0.35} color={ORANGE} />
    </Canvas>
  )
}
