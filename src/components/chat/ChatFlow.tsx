import { useEffect, useRef, useState } from 'react'
import { AssistantRuntimeProvider, ThreadPrimitive } from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/ai-sdk'

import { MessageBar } from '#/components/MessageBar'
import { AgentMessages } from './AgentMessages'
import { ChatMessage } from './ChatMessage'
import { EnergySlider } from './EnergySlider'
import { getRecipeSuggestions } from './recipes'
import type { Message, Recipe, WattsMood } from './types'

type Step = 'energy' | 'fridge' | 'recipes' | 'chat'

const THINK_MS = 700
const TALK_MS = 1600
const FRIDGE_SEEN_KEY = 'watts:fridge-step-seen'

const ENERGY_QUESTION: Message = {
  id: 'energy-question',
  from: 'watts',
  kind: 'text',
  text: 'How much energy do you have today?',
  highlight: 'energy',
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
  const [messages, setMessages] = useState<Message[]>([ENERGY_QUESTION])
  const [step, setStep] = useState<Step>('energy')
  const energyRef = useRef(5)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, step])

  function after(ms: number, fn: () => void) {
    timers.current.push(setTimeout(fn, ms))
  }

  function post(...added: Message[]) {
    setMessages((prev) => [...prev, ...added])
  }

  /** Watts "thinks", then speaks, then settles back to idle. */
  function wattsSays(reply: Message[] | Promise<Message[]>, then?: () => void) {
    onMoodChange?.('thinking')
    const ready = Promise.all([reply, new Promise((r) => after(THINK_MS, () => r(null)))])
    ready.then(([msgs]) => {
      post(...msgs)
      then?.()
      onMoodChange?.('talking')
      after(TALK_MS, () => onMoodChange?.('idle'))
    })
  }

  function showRecipes() {
    setStep('recipes')
    const energy = energyRef.current
    wattsSays(
      getRecipeSuggestions(energy).then((recipes) => [
        {
          id: newId(),
          from: 'watts',
          kind: 'text',
          text: `Three ideas for a ${energy}/10 day, quickest first.`,
          highlight: 'quickest',
        },
        { id: newId(), from: 'watts', kind: 'recipes', recipes },
      ]),
      () => setStep('chat'),
    )
  }

  function handleEnergy(energy: number) {
    energyRef.current = energy
    post({ id: newId(), from: 'user', kind: 'text', text: `${energy} / 10` })

    if (hasSeenFridgeStep()) {
      showRecipes()
      return
    }
    setStep('fridge')
    wattsSays([
      {
        id: newId(),
        from: 'watts',
        kind: 'text',
        text: 'Snap a photo of your fridge so I know what we’re working with.',
        highlight: 'fridge',
      },
    ])
  }

  function handlePhoto(file: File) {
    post({ id: newId(), from: 'user', kind: 'photo', url: URL.createObjectURL(file) })
    if (step === 'fridge') {
      markFridgeStepSeen()
      showRecipes()
    }
  }

  function skipFridge() {
    markFridgeStepSeen()
    post({ id: newId(), from: 'user', kind: 'text', text: 'Skip for now' })
    showRecipes()
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
      <ThreadPrimitive.Root className="flex h-full flex-col justify-end gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <ThreadPrimitive.Viewport className="flex max-h-[70%] flex-col gap-2 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_2rem)] pt-8">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} onCook={handleCook} />
          ))}

          {step === 'energy' && <EnergySlider onSubmit={handleEnergy} />}

          {step === 'fridge' && (
            <button
              type="button"
              onClick={skipFridge}
              className="self-start rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/70"
            >
              Skip for now
            </button>
          )}

          <AgentMessages />
          <div ref={endRef} />
        </ThreadPrimitive.Viewport>

        <MessageBar onSend={handleText} onPhoto={handlePhoto} />
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  )
}

function hasSeenFridgeStep() {
  try {
    return localStorage.getItem(FRIDGE_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markFridgeStepSeen() {
  try {
    localStorage.setItem(FRIDGE_SEEN_KEY, '1')
  } catch {
    // Storage blocked (private mode); the fridge step just shows again.
  }
}
