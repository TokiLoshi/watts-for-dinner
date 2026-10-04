import type { ReactNode } from 'react'
import { MessagePrimitive, ThreadPrimitive } from '@assistant-ui/react'

import { RecipeCard } from './ChatMessage'
import { WattsAvatar } from './WattsAvatar'
import { FRIDGE_INSTRUCTIONS } from './prompts'
import { recipeCardsFor } from './recipeResults'
import type { Recipe } from './types'

/** Messages from Bianca's streaming agent, styled like the scripted chat. */
export function AgentMessages({ onCook }: { onCook: (recipe: Recipe) => void }) {
  return (
    <ThreadPrimitive.Messages>
      {({ message }) => {
        const recipes = message.role === 'assistant' ? recipeCardsFor(message) : []
        // No empty Watts bubble while he's still working (tool calls, before text streams).
        const showBubble =
          message.role !== 'assistant' ||
          message.content.some((p) => p.type === 'text' && p.text.trim() !== '')
        return (
          <div className="flex flex-col gap-2">
            {showBubble && (
              <div className={message.role === 'assistant' ? 'flex items-end gap-2' : 'contents'}>
                {message.role === 'assistant' && <WattsAvatar />}
                <MessagePrimitive.Root
                  className={
                    message.role === 'user'
                      ? 'ml-auto flex max-w-[90%] flex-col items-end gap-2 text-base text-teal-world'
                      : 'min-w-0 flex-1 rounded-2xl rounded-bl-none border border-white/10 bg-card/80 px-4 py-3 text-base leading-relaxed text-white backdrop-blur-xl'
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
                          // The photo's instructions go to Watts but stay out of the chat.
                          text === FRIDGE_INSTRUCTIONS ? null : (
                            <p className="rounded-2xl rounded-br-md bg-cream px-4 py-2">
                              {withoutRecipeId(text)}
                            </p>
                          )
                        ) : (
                          <LightMarkdown text={text} />
                        ),
                    }}
                  />
                </MessagePrimitive.Root>
              </div>
            )}
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onCook={onCook} />
            ))}
          </div>
        )
      }}
    </ThreadPrimitive.Messages>
  )
}

/** "Let's cook X (recipe 123)" reads as "Let's cook X"; Watts still gets the id. */
function withoutRecipeId(text: string) {
  return text.replace(/\s*\(recipe \d+\)\s*$/, '')
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
