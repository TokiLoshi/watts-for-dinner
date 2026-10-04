import { Clock, Zap } from 'lucide-react'

import type { Message, Recipe } from './types'

export function ChatMessage({
  message,
  onCook,
}: {
  message: Message
  onCook: (recipe: Recipe) => void
}) {
  if (message.kind === 'photo') {
    return (
      <img
        src={message.url}
        alt="Your fridge"
        className="ml-auto max-h-48 rounded-2xl border-2 border-lime object-cover"
      />
    )
  }

  if (message.kind === 'recipes') {
    return (
      <div className="flex flex-col gap-2">
        {message.recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onCook={onCook} />
        ))}
      </div>
    )
  }

  if (message.from === 'user') {
    return (
      <p className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-cream px-4 py-2 text-base text-teal-world">
        {message.text}
      </p>
    )
  }

  const shape = message.centered
    ? 'w-full rounded-2xl text-center'
    : 'w-full rounded-2xl rounded-bl-md'
  return (
    <p className={`${shape} border border-white/10 bg-card/80 px-4 py-3 font-serif text-2xl leading-snug text-white backdrop-blur-xl`}>
      <Highlighted text={message.text} word={message.highlight} />
    </p>
  )
}

/** Serif line with one italic lime word. */
function Highlighted({ text, word }: { text: string; word?: string }) {
  const at = word ? text.indexOf(word) : -1
  if (!word || at === -1) return text
  return (
    <>
      {text.slice(0, at)}
      <em className="text-lime">{word}</em>
      {text.slice(at + word.length)}
    </>
  )
}

function RecipeCard({
  recipe,
  onCook,
}: {
  recipe: Recipe
  onCook: (recipe: Recipe) => void
}) {
  return (
    <article className="flex items-center gap-3 rounded-2xl bg-cream p-2.5 text-teal-world shadow-lg shadow-black/20">
      <img
        src={recipe.image}
        alt=""
        className="size-20 shrink-0 rounded-xl bg-teal-world/10 object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="font-serif text-base leading-tight">{recipe.title}</h3>
        <div className="flex gap-3 text-xs text-teal-world/60">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" /> {recipe.cookMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Zap className="size-3.5 text-strain" /> Effort {recipe.energy}/10
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onCook(recipe)}
        className="h-12 shrink-0 rounded-full bg-lime px-4 text-sm font-semibold text-teal-world transition active:scale-[0.97]"
      >
        Cook this
      </button>
    </article>
  )
}
