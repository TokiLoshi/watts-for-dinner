import { useEffect, useRef } from 'react'
import { useAuiState } from '@assistant-ui/react'

import { FRIDGE_CAPTION } from './prompts'

/** Tools worth naming; quiet lookups (profile, recovery, recent meals) keep the step's text. */
const TOOL_LABELS: Record<string, string> = {
  findRecipes: 'Finding recipes…',
  getCookingSteps: 'Getting the cooking steps…',
  getShoppingList: 'Writing your shopping list…',
  logMeal: 'Making a note of that…',
  rateMeal: 'Making a note of that…',
}

type Part = { type: string; text?: string; toolName?: string; image?: string }
type Msg = { role: string; content: readonly Part[]; attachments?: readonly unknown[] }

/** What Watts is up to, or null once his text is streaming (or he's done). */
function thinkingLabel(isRunning: boolean, messages: readonly Msg[]): string | null {
  if (!isRunning) return null

  const last = messages.at(-1)
  const reply = last?.role === 'assistant' ? last : undefined
  const lastPart = reply?.content.at(-1)
  if (lastPart?.type === 'text' && lastPart.text?.trim()) return null
  if (lastPart?.type === 'tool-call' && lastPart.toolName && TOOL_LABELS[lastPart.toolName]) {
    return TOOL_LABELS[lastPart.toolName]
  }

  const asked = [...messages].reverse().find((m) => m.role === 'user')
  const askedText = asked?.content.map((p) => p.text ?? '').join(' ') ?? ''
  if (askedText.includes(FRIDGE_CAPTION) || asked?.content.some((p) => p.type === 'image')) {
    return 'Watts is peeking in your fridge…'
  }
  if (/^Energy: \d+\/10/.test(askedText)) return 'Finding recipes…'
  return 'Watts is thinking…'
}

/** Bouncing lime dots + italic step text while Watts works, gone once he starts talking. */
export function ThinkingBubble() {
  const isRunning = useAuiState((s) => s.thread.isRunning)
  const messages = useAuiState((s) => s.thread.messages) as readonly Msg[]
  const label = thinkingLabel(isRunning, messages)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (label) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [label])

  if (!label) return null
  return (
    <div
      ref={ref}
      role="status"
      className="flex max-w-[90%] items-center gap-3 self-start rounded-2xl rounded-bl-md border border-white/10 bg-card/80 px-4 py-3 backdrop-blur-xl"
    >
      <span className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-soft-bounce size-2 rounded-full bg-lime"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </span>
      <span className="font-serif text-base text-white/80 italic">{label}</span>
    </div>
  )
}
