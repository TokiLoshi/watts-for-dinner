import { MessagePrimitive, ThreadPrimitive } from '@assistant-ui/react'

/** Messages from Bianca's streaming agent, styled like the scripted chat. */
export function AgentMessages() {
  return (
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
  )
}
