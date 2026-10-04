import { useEffect, useRef, useState } from 'react'
import { AssistantRuntimeProvider, ThreadPrimitive, useAuiState } from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/ai-sdk'

import { MessageBar } from '#/components/MessageBar'
import { AgentMessages } from './AgentMessages'
import { ChatMessage } from './ChatMessage'
import { EnergySlider } from './EnergySlider'
import { toPhotoDataUrl } from './photo'
import type { Message, Recipe, WattsMood } from './types'

/** fridge: waiting for a photo · reading: Watts is listing ingredients · energy: slider · chat: free chat */
type Step = 'fridge' | 'reading' | 'energy' | 'chat'

const FRIDGE_QUESTION: Message = {
  id: 'fridge-question',
  from: 'watts',
  kind: 'text',
  text: 'Snap a photo of your fridge so I know what we’re working with.',
  highlight: 'fridge',
  centered: true,
}

const FRIDGE_PROMPT = 'Here’s my fridge. What ingredients can you see? List them.'

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
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, step])

  function post(...added: Message[]) {
    setMessages((prev) => [...prev, ...added])
  }

  async function handlePhoto(file: File) {
    const image = await toPhotoDataUrl(file)
    runtime.thread.append({
      role: 'user',
      content: [
        { type: 'image', image },
        { type: 'text', text: FRIDGE_PROMPT },
      ],
    })
    if (step === 'fridge') setStep('reading')
  }

  function skipFridge() {
    post({ id: newId(), from: 'user', kind: 'text', text: 'Skip for now' })
    setStep('energy')
  }

  function handleEnergy(energy: number) {
    runtime.thread.append(`My energy is ${energy}/10`)
    setStep('chat')
  }

  // Typed messages and "Cook this" go to Bianca's streaming agent.
  function handleCook(recipe: Recipe) {
    runtime.thread.append(`Let’s cook ${recipe.title}`)
  }

  function handleText(text: string) {
    runtime.thread.append(text)
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ReplyWatcher
        onMoodChange={onMoodChange}
        onReplyDone={() => setStep((s) => (s === 'reading' ? 'energy' : s))}
      />
      <ThreadPrimitive.Root className="flex h-full flex-col justify-end gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <ThreadPrimitive.Viewport className="flex max-h-[70%] flex-col gap-2 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_2rem)] pt-8">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} onCook={handleCook} />
          ))}

          <AgentMessages />

          {step === 'fridge' && (
            <button
              type="button"
              onClick={skipFridge}
              className="self-start rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/70"
            >
              Skip for now
            </button>
          )}

          {step === 'energy' && <EnergySlider onSubmit={handleEnergy} />}

          <div ref={endRef} />
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
