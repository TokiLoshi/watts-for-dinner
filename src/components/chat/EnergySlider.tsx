import { useState } from 'react'

export function EnergySlider({ onSubmit }: { onSubmit: (energy: number) => void }) {
  const [energy, setEnergy] = useState(5)

  return (
    <div className="rounded-3xl border border-white/10 bg-card/80 p-4 backdrop-blur-xl">
      <div className="flex items-baseline justify-center gap-1 font-serif">
        <span className="text-5xl text-lime">{energy}</span>
        <span className="text-xl text-white/50">/ 10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={energy}
        onChange={(e) => setEnergy(Number(e.target.value))}
        aria-label="Energy today, 1 to 10"
        className="mt-3 w-full accent-lime"
      />
      <div className="flex justify-between text-xs text-white/50">
        <span>Running on empty</span>
        <span>Full power</span>
      </div>
      <button
        type="button"
        onClick={() => onSubmit(energy)}
        className="mt-4 h-11 w-full rounded-full bg-lime font-medium text-teal-world transition active:scale-[0.98]"
      >
        Lock it in
      </button>
    </div>
  )
}
