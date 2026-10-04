import {
  AssistantRuntimeProvider,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/ai-sdk'

import { MessageBar } from '#/components/MessageBar'

// Bianca's assistant-ui chat, styled to float over the Watts scene.
// The runtime posts to /api/chat (the default); don't change that here.
export function WattsChat() {
  const runtime = useChatRuntime()

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="flex h-full flex-col justify-end gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <ThreadPrimitive.Viewport className="flex max-h-[70%] flex-col gap-2 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_2rem)] pt-8">
          <ThreadPrimitive.Empty>
            <p className="max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-card/80 px-4 py-2.5 text-sm text-white backdrop-blur-xl">
              Say hi to Watts and tell him how your day&rsquo;s going.
            </p>
          </ThreadPrimitive.Empty>
          <ThreadPrimitive.Messages>
            {({ message }) => (
              <MessagePrimitive.Root
                className={
                  message.role === 'user'
                    ? 'ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-cream px-4 py-2 text-sm text-teal-world'
                    : 'max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-card/80 px-4 py-2.5 text-sm text-white backdrop-blur-xl'
                }
              >
                <MessagePrimitive.Parts />
              </MessagePrimitive.Root>
            )}
          </ThreadPrimitive.Messages>
        </ThreadPrimitive.Viewport>

        <MessageBar
          onSend={(text) => runtime.thread.append(text)}
          onPhoto={(file) => console.log('photo', file.name)}
        />
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  )
}
