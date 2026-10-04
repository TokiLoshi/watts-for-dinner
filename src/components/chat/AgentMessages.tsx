import type { ReactNode } from 'react'
import { MessagePrimitive, ThreadPrimitive } from '@assistant-ui/react'

/** Messages from Bianca's streaming agent, styled like the scripted chat. */
export function AgentMessages() {
  return (
    <ThreadPrimitive.Messages>
      {({ message }) => (
        <MessagePrimitive.Root
          className={
            message.role === 'user'
              ? 'ml-auto flex max-w-[90%] flex-col items-end gap-2 text-base text-teal-world'
              : 'w-full rounded-2xl rounded-bl-md border border-white/10 bg-card/80 px-4 py-3 text-base leading-relaxed text-white backdrop-blur-xl'
          }
        >
          {/* Photos arrive as attachments, not message parts. */}
          {message.attachments?.flatMap((a) =>
            a.content.map((c, i) =>
              c.type === 'image' ? <FridgePhoto key={`${a.id}-${i}`} src={c.image} /> : null,
            ),
          )}
          <MessagePrimitive.Parts
            components={{
              Image: ({ image }) => <FridgePhoto src={image} />,
              Text: ({ text }) =>
                message.role === 'user' ? (
                  <p className="rounded-2xl rounded-br-md bg-cream px-4 py-2">{text}</p>
                ) : (
                  <LightMarkdown text={text} />
                ),
            }}
          />
        </MessagePrimitive.Root>
      )}
    </ThreadPrimitive.Messages>
  )
}

function FridgePhoto({ src }: { src: string }) {
  return (
    <img src={src} alt="Your fridge" className="max-h-56 rounded-2xl border-2 border-lime object-cover" />
  )
}

/** Just enough markdown for Watts's replies: bullet lists, **bold** and [links](url). */
function LightMarkdown({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let items: string[] = []
  const flushList = () => {
    if (!items.length) return
    blocks.push(
      <ul key={blocks.length} className="my-1 list-disc space-y-0.5 pl-5">
        {items.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>,
    )
    items = []
  }

  for (const line of text.split('\n')) {
    const bullet = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)/)
    if (bullet) {
      items.push(bullet[1])
      continue
    }
    flushList()
    if (line.trim()) blocks.push(<p key={blocks.length} className="my-1">{inline(line.replace(/^#+\s*/, ''))}</p>)
  }
  flushList()
  return <>{blocks}</>
}

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).map((part, i) => {
    const bold = part.match(/^\*\*(.+)\*\*$/)
    if (bold) return <strong key={i}>{bold[1]}</strong>
    const link = part.match(/^\[(.+)\]\((https?:\/\/[^)\s]+)\)$/)
    if (link)
      return (
        <a key={i} href={link[2]} target="_blank" rel="noreferrer" className="text-lime underline">
          {link[1]}
        </a>
      )
    return part
  })
}
