export function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm transition active:scale-[0.97] ${
        selected
          ? 'border-lime bg-lime text-teal-world'
          : 'border-white/15 bg-card/80 text-white/80'
      }`}
    >
      {children}
    </button>
  )
}
