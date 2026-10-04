import { useAuiState } from '@assistant-ui/react'

import { recipeCardsFor } from './recipeResults'

export const SHOW_MORE_MESSAGE = 'None of those feel right. Show me 3 different recipes.'
const CHIPS = ['Surprise me', 'Something light', 'Comfort food', 'High protein']

/** Under Watts's latest reply, once it's finished, if that reply searched for recipes. */
export function ShowMoreButton({ onSend }: { onSend: (text: string) => void }) {
  const show = useAuiState((s) => {
    const last = s.thread.messages.at(-1)
    return (
      !s.thread.isRunning &&
      last?.role === 'assistant' &&
      last.content.some((p) => p.type === 'tool-call' && p.toolName === 'findRecipes')
    )
  })
  if (!show) return null
  return (
    <button
      type="button"
      onClick={() => onSend(SHOW_MORE_MESSAGE)}
      className="min-h-12 w-full rounded-full border-2 border-lime text-base font-medium text-cream transition active:scale-[0.98]"
    >
      Show me 3 more
    </button>
  )
}

/** Quick replies, shown only once Watts's reply has finished, and only until recipe cards appear. */
export function QuickReplyChips({ onSend }: { onSend: (text: string) => void }) {
  const hidden = useAuiState(
    (s) =>
      s.thread.isRunning ||
      s.thread.messages.some((m) => m.role === 'assistant' && recipeCardsFor(m).length > 0),
  )
  if (hidden) return null
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => onSend(`Craving: ${chip.toLowerCase()}`)}
          className="rounded-full border border-lime/50 bg-card/80 px-4 py-2 text-sm text-cream backdrop-blur-xl transition active:scale-[0.97]"
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
