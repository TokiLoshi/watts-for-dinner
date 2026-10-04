import { useRef, useState } from 'react'
import { ArrowRight, Camera } from 'lucide-react'

type MessageBarProps = {
  onSend: (text: string) => void
  onPhoto: (file: File) => void
  placeholder?: string
}

export function MessageBar({
  onSend,
  onPhoto,
  placeholder = 'Ask Watts anything',
}: MessageBarProps) {
  const [text, setText] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        aria-label="Add a fridge photo"
        className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-card text-cream transition hover:bg-card/80"
      >
        <Camera className="size-5" strokeWidth={1.8} />
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPhoto(file)
          e.target.value = ''
        }}
      />
      <div className="animate-bar-glow flex h-12 min-w-0 flex-1 items-center rounded-full border-2 border-lime bg-cream pr-1 pl-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-teal-world placeholder:text-teal-world/50 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!text.trim()}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lime text-teal-world transition disabled:opacity-40"
        >
          <ArrowRight className="size-5" strokeWidth={2} />
        </button>
      </div>
    </form>
  )
}
