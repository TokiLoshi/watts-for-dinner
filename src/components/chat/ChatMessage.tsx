import { Clock, Zap } from 'lucide-react'

import type { Message, Recipe } from './types'

export function ChatMessage({ message }: { message: Message }) {
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
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    )
  }

  if (message.from === 'user') {
    return (
      <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-cream px-4 py-2 text-sm text-teal-world">
        {message.text}
      </p>
    )
  }

  return (
    <p className="max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-card/80 px-4 py-2.5 font-serif text-xl leading-snug text-white backdrop-blur-xl">
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

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-card/80 px-4 py-3 backdrop-blur-xl">
      <h3 className="text-sm font-medium text-white">{recipe.title}</h3>
      <div className="mt-1 flex gap-4 text-xs text-white/60">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" /> {recipe.cookMinutes} min
        </span>
        <span className="flex items-center gap-1">
          <Zap className="size-3.5 text-strain" /> Effort {recipe.energy}/10
        </span>
      </div>
    </article>
  )
}
