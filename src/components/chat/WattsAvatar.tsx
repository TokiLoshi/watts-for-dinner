/** Chef Watts from public/favicon.svg, without its dark background tile. */
function WattsDrawing({ thinking = false, className }: { thinking?: boolean; className?: string }) {
  return (
    <svg viewBox="8 4 48 56" className={className} aria-hidden="true">
      <path d="M14 40 C12 28 20 22 32 22 C45 22 52 29 50 41 C48 53 40 58 31 58 C21 58 15 51 14 40 Z" fill="#D58D55" />
      <path d="M20 22 C16 22 15 15 20 13 C21 7 29 6 32 10 C35 6 43 7 44 13 C49 15 48 22 44 22 Z" fill="#F3F5EE" />
      <rect x="20" y="20" width="24" height="5" rx="2" fill="#E2E6DC" />
      <circle cx="26" cy="37" r="2.6" fill="#2A1A10" />
      <circle cx="38" cy="37" r="2.6" fill="#2A1A10" />
      {thinking ? (
        <path d="M28.5 46 H35.5" stroke="#2A1A10" strokeWidth="2.6" strokeLinecap="round" />
      ) : (
        <path d="M27 45 Q32 49 37 45" stroke="#2A1A10" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      )}
    </svg>
  )
}

/** 32px round avatar beside Watts's bubbles; bobs with a "hmm" mouth while thinking. */
export function WattsAvatar({ thinking = false }: { thinking?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2F3E48] ${thinking ? 'animate-watts-bob' : ''}`}
    >
      <WattsDrawing thinking={thinking} className="size-7" />
    </span>
  )
}

/** Big floating Chef Watts with a soft lime glow, for the start of the chat. */
export function WattsHero() {
  return (
    <div aria-hidden="true" className="relative flex size-40 items-center justify-center">
      <div className="absolute inset-4 rounded-full bg-lime/25 blur-2xl" />
      <WattsDrawing className="animate-watts-float relative size-40 drop-shadow-[0_0_18px_rgb(181_210_119_/_0.35)]" />
    </div>
  )
}
