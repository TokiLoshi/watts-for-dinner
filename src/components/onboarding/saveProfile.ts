/** Contract with Bianca (see CLAUDE.md). Don't change without asking her. */
export type Profile = {
  dietaryPreferences: string[]
  goal: 'performance' | 'lose_weight' | 'build_muscle' | 'maintain' | 'other'
  goalNote?: string
  favouriteMeals: string[]
  lastNightDinner: string
}

/**
 * Fake until Bianca's `saveProfile` server function exists.
 * Swap the import in src/routes/onboarding/index.tsx for hers.
 */
export async function saveProfile(profile: Profile): Promise<void> {
  console.log('[fake saveProfile]', profile)
}
