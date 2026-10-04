/** Matches the Watts 3D component contract. */
export type WattsMood = 'idle' | 'thinking' | 'talking'

export type Recipe = {
  id: string
  title: string
  cookMinutes: number
  /** Effort needed, 1–10, compared against the user's energy score. */
  energy: number
  /** Path under public/, e.g. /recipes/lasagna.jpg */
  image: string
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
