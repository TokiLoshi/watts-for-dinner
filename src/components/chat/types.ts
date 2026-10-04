/** Matches the Watts 3D component contract. */
export type WattsMood = 'idle' | 'thinking' | 'talking'

export type Recipe = {
  id: string
  title: string
  cookMinutes: number
  /** Effort needed, 1–10. Bianca's recipe search doesn't provide this yet. */
  energy?: number
  /** Path under public/ or a Spoonacular image URL; null when there's no photo. */
  image: string | null
  sourceUrl?: string | null
  sourceName?: string | null
  /** Ingredient names from the fridge this recipe uses. */
  usedIngredients?: string[]
  /** Ingredient names the user still needs to buy. */
  missingIngredients?: string[]
}

export type Message =
  | {
      id: string
      from: 'watts' | 'user'
      kind: 'text'
      text: string
      highlight?: string
      /** Full-width, centred question (Watts only). */
      centered?: boolean
    }
  | { id: string; from: 'user'; kind: 'photo'; url: string }
  | { id: string; from: 'watts'; kind: 'recipes'; recipes: Recipe[] }
