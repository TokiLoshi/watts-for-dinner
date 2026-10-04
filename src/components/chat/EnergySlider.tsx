import { useState } from 'react'

function energyMood(energy: number) {
  if (energy <= 3) return 'Running on fumes'
  if (energy <= 6) return 'Up for something simple'
  if (energy <= 8) return 'Feeling good'
  return 'Cooking up a storm'
}

export function EnergySlider({ onSubmit }: { onSubmit: (energy: number) => void }) {
  const [energy, setEnergy] = useState(5)

  return (
    <div className="rounded-3xl border border-white/10 bg-card/80 p-4 backdrop-blur-xl">
      <div className="flex items-baseline justify-center gap-1 font-serif">
        <span className="text-5xl text-lime">{energy}</span>
        <span className="text-xl text-white/50">/ 10</span>
      </div>
      <p className="mt-1 text-center font-serif text-lg text-lime/90 italic" aria-live="polite">
        {energyMood(energy)}
      </p>
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
        <span>Too tired to cook</span>
        <span>Cooking up a storm</span>
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
