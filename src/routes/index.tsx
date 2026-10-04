import { createFileRoute } from '@tanstack/react-router'
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/ai-sdk'

export const Route = createFileRoute('/')({ component: Home })

// Plain chat UI from assistant-ui primitives. Posts to /api/chat (the default).
// Unstyled on purpose: Michael will move this into src/components and style it.
function Home() {
  const runtime = useChatRuntime()

  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col p-4">
      <h1 className="mb-4 text-3xl font-bold">Watts for Dinner</h1>
      <AssistantRuntimeProvider runtime={runtime}>
        <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col">
          <ThreadPrimitive.Viewport className="flex-1 space-y-3 overflow-y-auto">
            <ThreadPrimitive.Empty>
              <p>Say hi to Watts and tell him how your day's going.</p>
            </ThreadPrimitive.Empty>
            <ThreadPrimitive.Messages>
              {({ message }) => (
                <MessagePrimitive.Root>
                  <strong>{message.role === 'user' ? 'You' : 'Watts'}: </strong>
                  <MessagePrimitive.Parts />
                </MessagePrimitive.Root>
              )}
            </ThreadPrimitive.Messages>
          </ThreadPrimitive.Viewport>
          <ComposerPrimitive.Root className="mt-4 flex gap-2">
            <ComposerPrimitive.Input
              className="flex-1 border p-2"
              placeholder="Message Watts…"
              autoFocus
            />
            <ComposerPrimitive.Send className="border px-4">Send</ComposerPrimitive.Send>
          </ComposerPrimitive.Root>
        </ThreadPrimitive.Root>
      </AssistantRuntimeProvider>
    </main>
  )
}
