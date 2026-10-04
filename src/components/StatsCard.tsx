import { Leaf } from 'lucide-react'

type StatsCardProps = {
  /** Whoop recovery, 0–100. */
  recovery: number
  /** Whoop strain, 0–21. */
  strain: number
  mealPref: string
}

export function StatsCard({ recovery, strain, mealPref }: StatsCardProps) {
  return (
    <section className="flex items-start justify-around rounded-3xl border border-white/10 bg-card/80 p-4 shadow-lg shadow-black/20 backdrop-blur-xl">
      <Ring
        label="Recovery"
        value={`${Math.round(recovery)}%`}
        fraction={recovery / 100}
        color="var(--color-recovery)"
      />
      <Ring
        label="Strain"
        value={strain.toFixed(1)}
        fraction={strain / 21}
        color="var(--color-strain)"
      />
      <Stat label={mealPref}>
        <div className="flex size-full items-center justify-center rounded-full border-[7px] border-lime/25">
          <Leaf className="size-7 text-lime" strokeWidth={1.8} />
        </div>
      </Stat>
    </section>
  )
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-20 flex-col items-center gap-1.5">
      <div className="relative size-20">{children}</div>
      <span className="text-center text-xs text-white/70">{label}</span>
    </div>
  )
}

type RingProps = {
  label: string
  value: string
  fraction: number
  color: string
}

const RADIUS = 34
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function Ring({ label, value, fraction, color }: RingProps) {
  const clamped = Math.min(Math.max(fraction, 0), 1)
  return (
    <Stat label={label}>
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          className="text-white/10"
        />
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-white">
        {value}
      </span>
    </Stat>
  )
}
