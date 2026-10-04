import { useEffect, useRef, useState } from 'react'
import { AssistantRuntimeProvider, ThreadPrimitive, useAuiState } from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/ai-sdk'

import { MessageBar } from '#/components/MessageBar'
import { AgentMessages } from './AgentMessages'
import { ChatMessage } from './ChatMessage'
import { EnergySlider } from './EnergySlider'
import { toPhotoDataUrl } from './photo'
import { FRIDGE_CAPTION, FRIDGE_INSTRUCTIONS } from './prompts'
import { QuickReplyChips, ShowMoreButton } from './QuickReplies'
import { ThinkingBubble } from './ThinkingBubble'
import { useStickToBottom } from './useStickToBottom'
import { WattsHero } from './WattsAvatar'
import type { Message, Recipe, WattsMood } from './types'

/** fridge: waiting for a photo · reading: Watts is listing ingredients · energy: slider · chat: free chat */
type Step = 'fridge' | 'reading' | 'energy' | 'chat'

const FRIDGE_QUESTION: Message = {
  id: 'fridge-question',
  from: 'watts',
  kind: 'text',
  text: 'Hi, I’m Chef Watts! Let’s get cooking. Snap a photo of your fridge so I know what we’re working with.',
  highlight: 'fridge',
  centered: true,
}

let nextId = 0
const newId = () => `m${++nextId}`

export function ChatFlow({
  onMoodChange,
}: {
  onMoodChange?: (mood: WattsMood) => void
}) {
  // Bianca's agent runtime; posts to /api/chat (the default). Don't change that here.
  const runtime = useChatRuntime()
  const [messages, setMessages] = useState<Message[]>([FRIDGE_QUESTION])
  const [step, setStep] = useState<Step>('fridge')
  // Quick-reply chips go under Watts's first reply after the energy score, until the user sends something.
  const [showChips, setShowChips] = useState(false)
  const viewportRef = useStickToBottom<HTMLDivElement>()

  function post(...added: Message[]) {
    setMessages((prev) => [...prev, ...added])
  }

  async function handlePhoto(file: File) {
    setShowChips(false)
    const image = await toPhotoDataUrl(file)
    runtime.thread.append({
      role: 'user',
      content: [
        { type: 'image', image },
        { type: 'text', text: FRIDGE_CAPTION },
        { type: 'text', text: FRIDGE_INSTRUCTIONS },
      ],
    })
    if (step === 'fridge') setStep('reading')
  }

  function skipFridge() {
    post({ id: newId(), from: 'user', kind: 'text', text: 'Skip for now' })
    setStep('energy')
  }

  function handleEnergy(energy: number) {
    runtime.thread.append(`Energy: ${energy}/10`)
    setStep('chat')
    setShowChips(true)
  }

  // Typed messages and "Cook this" go to Bianca's streaming agent.
  function handleCook(recipe: Recipe) {
    handleText(`Let's cook ${recipe.title} (recipe ${recipe.id})`)
  }

  function handleText(text: string) {
    setShowChips(false)
    runtime.thread.append(text)
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ReplyWatcher
        onMoodChange={onMoodChange}
        onReplyDone={() => setStep((s) => (s === 'reading' ? 'energy' : s))}
      />
      <ThreadPrimitive.Root className="flex h-full flex-col justify-end gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <ThreadPrimitive.Viewport
          ref={viewportRef}
          autoScroll={false}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_2rem)] pt-8">
          {/* Fills the empty space above a short chat with big Watts; scrolls away as messages arrive. */}
          <div className="flex flex-1 shrink-0 items-center justify-center py-6">
            <WattsHero />
          </div>
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} onCook={handleCook} />
          ))}

          <AgentMessages onCook={handleCook} />
          <ThinkingBubble />

          {step === 'chat' && <ShowMoreButton onSend={handleText} />}
          {showChips && <QuickReplyChips onSend={handleText} />}

          {step === 'fridge' && (
            <button
              type="button"
              onClick={skipFridge}
              className="self-start rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80"
            >
              Skip for now
            </button>
          )}

          {step === 'energy' && <EnergySlider onSubmit={handleEnergy} />}

        </ThreadPrimitive.Viewport>

        <MessageBar onSend={handleText} onPhoto={handlePhoto} />
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  )
}

/** Tells ChatFlow when Watts finishes a streamed reply, and drives his mood meanwhile. */
function ReplyWatcher({
  onReplyDone,
  onMoodChange,
}: {
  onReplyDone: () => void
  onMoodChange?: (mood: WattsMood) => void
}) {
  const isRunning = useAuiState((s) => s.thread.isRunning)
  const wasRunning = useRef(false)

  useEffect(() => {
    if (isRunning) onMoodChange?.('talking')
    if (wasRunning.current && !isRunning) {
      onMoodChange?.('idle')
      onReplyDone()
    }
    wasRunning.current = isRunning
  }, [isRunning, onReplyDone, onMoodChange])

  return null
}
