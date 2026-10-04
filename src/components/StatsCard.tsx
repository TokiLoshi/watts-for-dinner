import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { User } from 'lucide-react'

import { getRecoverySummary } from '#/server/recovery'
import type { RecoverySummary } from '#/server/recovery'

const EMPTY: RecoverySummary = { connected: true, recoveryScore: null, dayStrain: null }

export function StatsCard() {
  // null while loading; shows "–" in the rings until Whoop answers.
  const [summary, setSummary] = useState<RecoverySummary | null>(null)

  useEffect(() => {
    let live = true
    getRecoverySummary()
      .then((s) => live && setSummary(s))
      .catch((err) => {
        console.error('getRecoverySummary failed', err)
        if (live) setSummary(EMPTY)
      })
    return () => {
      live = false
    }
  }, [])

  const { connected, recoveryScore, dayStrain } = summary ?? EMPTY

  return (
    <section className="flex items-start justify-around rounded-3xl border border-white/10 bg-card/80 p-4 shadow-lg shadow-black/20 backdrop-blur-xl">
      {connected ? (
        <>
          <Ring
            label="Recovery"
            value={recoveryScore === null ? '–' : `${Math.round(recoveryScore)}%`}
            fraction={(recoveryScore ?? 0) / 100}
            color="var(--color-recovery)"
          />
          <Ring
            label="Strain"
            value={dayStrain === null ? '–' : dayStrain.toFixed(1)}
            fraction={(dayStrain ?? 0) / 21}
            color="var(--color-strain)"
          />
        </>
      ) : (
        <div className="flex h-20 flex-1 items-center justify-center pr-3">
          <a
            href="/api/whoop/connect"
            className="flex h-12 w-full items-center justify-center rounded-full bg-lime text-base font-semibold text-teal-world transition active:scale-[0.98]"
          >
            Connect Whoop
          </a>
        </div>
      )}
      <Link to="/profile" aria-label="Your profile" className="transition active:scale-95">
        <Stat label="Profile">
          <div className="flex size-full items-center justify-center rounded-full border-[7px] border-lime/25">
            <User className="size-7 text-lime" strokeWidth={1.8} />
          </div>
        </Stat>
      </Link>
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
