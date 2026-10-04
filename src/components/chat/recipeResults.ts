import type { Recipe } from './types'

/** One recipe as Bianca's findRecipes tool returns it (src/recipes/spoonacular.ts, RecipeOption). */
type RecipeOption = {
  id: number
  title: string
  readyInMinutes: number
  image: string | null
}

type MessagePart =
  | { type: 'text'; text: string }
  | { type: 'tool-call'; toolName: string; result?: unknown }
  | { type: string }

/**
 * Recipe cards for a finished Watts reply: the findRecipes results he actually
 * names in his text, or all of them if he names none. Nothing while streaming.
 */
export function recipeCardsFor(message: {
  content: readonly MessagePart[]
  status?: { type: string }
}): Recipe[] {
  if (message.status?.type === 'running') return []

  const found = new Map<number, RecipeOption>()
  let text = ''
  for (const part of message.content) {
    if (part.type === 'text' && 'text' in part) text += part.text.toLowerCase()
    if (part.type === 'tool-call' && 'toolName' in part && part.toolName === 'findRecipes') {
      const result = part.result as { recipes?: RecipeOption[] } | undefined
      for (const r of result?.recipes ?? []) found.set(r.id, r)
    }
  }

  const all = [...found.values()]
  const named = all.filter((r) => text.includes(r.title.toLowerCase()))
  return (named.length ? named : all).map((r) => ({
    id: String(r.id),
    title: r.title,
    cookMinutes: r.readyInMinutes,
    image: r.image,
  }))
}
