import type { Recipe } from './types'

// Stand-in data until Bianca's recipe server function exists. Two recipes per
// energy level so every score has at least three matches within ±1. Photos are
// from Unsplash, saved in public/recipes/ (credits in the README).
const MOCK_RECIPES: Recipe[] = (
  [
    { id: 'yogurt-bowl', title: 'Greek yogurt bowl with honey & walnuts', cookMinutes: 3, energy: 1 },
    { id: 'avo-toast', title: 'Avocado toast with chili flakes', cookMinutes: 5, energy: 1 },
    { id: 'caprese', title: 'Caprese salad', cookMinutes: 7, energy: 2 },
    { id: 'hummus-wrap', title: 'Hummus & veggie wrap', cookMinutes: 8, energy: 2 },
    { id: 'tuna-bean', title: 'Tuna & white bean salad', cookMinutes: 10, energy: 3 },
    { id: 'peanut-noodles', title: 'Cold peanut noodle bowl', cookMinutes: 12, energy: 3 },
    { id: 'quesadillas', title: 'Chicken quesadillas', cookMinutes: 15, energy: 4 },
    { id: 'shakshuka', title: 'Shakshuka', cookMinutes: 20, energy: 4 },
    { id: 'bean-tacos', title: 'Black bean tacos', cookMinutes: 18, energy: 5 },
    { id: 'garlic-shrimp', title: 'Garlic butter shrimp & rice', cookMinutes: 20, energy: 5 },
    { id: 'pesto-chicken', title: 'Pesto pasta with chicken', cookMinutes: 22, energy: 6 },
    { id: 'teriyaki-salmon', title: 'Teriyaki salmon with greens', cookMinutes: 25, energy: 6 },
    { id: 'beef-stir-fry', title: 'Beef & broccoli stir-fry', cookMinutes: 25, energy: 7 },
    { id: 'green-curry', title: 'Thai green curry', cookMinutes: 35, energy: 7 },
    { id: 'burrito-bowls', title: 'Homemade burrito bowls', cookMinutes: 40, energy: 8 },
    { id: 'tikka-masala', title: 'Chicken tikka masala', cookMinutes: 45, energy: 8 },
    { id: 'roast-chicken', title: 'Roast chicken with vegetables', cookMinutes: 70, energy: 9 },
    { id: 'lasagna', title: 'Lasagna', cookMinutes: 75, energy: 9 },
    { id: 'fresh-pasta', title: 'Fresh pasta with ragù', cookMinutes: 120, energy: 10 },
    { id: 'ramen', title: 'Homemade ramen', cookMinutes: 150, energy: 10 },
  ] satisfies Omit<Recipe, 'image'>[]
).map((r) => ({ ...r, image: `/recipes/${r.id}.jpg` }))

/** Three recipes within ±1 of the energy score, shortest cook time first. */
export async function getRecipeSuggestions(energy: number): Promise<Recipe[]> {
  return MOCK_RECIPES.filter((r) => Math.abs(r.energy - energy) <= 1)
    .sort((a, b) => a.cookMinutes - b.cookMinutes)
    .slice(0, 3)
}
