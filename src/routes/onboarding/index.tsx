import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus, X } from 'lucide-react'

import { Chip } from '#/components/onboarding/Chip'
import { saveProfile } from '#/components/onboarding/saveProfile'
import type { Profile } from '#/components/onboarding/saveProfile'

export const Route = createFileRoute('/onboarding/')({ component: Onboarding })

const DIETS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-free',
  'Dairy-free',
  'Nut-free',
  'Halal',
  'Kosher',
  'Low-carb',
]

const GOALS: { value: Profile['goal']; label: string }[] = [
  { value: 'performance', label: 'Performance' },
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'build_muscle', label: 'Build muscle' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'other', label: 'Other' },
]

const input =
  'h-12 w-full rounded-2xl border border-white/15 bg-card/80 px-4 text-sm text-white placeholder:text-white/40 focus:border-lime focus:outline-none'

function Onboarding() {
  const navigate = useNavigate()
  const [diets, setDiets] = useState<string[]>([])
  const [goal, setGoal] = useState<Profile['goal'] | null>(null)
  const [goalNote, setGoalNote] = useState('')
  const [meals, setMeals] = useState<string[]>([])
  const [mealDraft, setMealDraft] = useState('')
  const [lastNight, setLastNight] = useState('')
  const [saving, setSaving] = useState(false)

  const canSubmit = goal !== null && lastNight.trim() !== '' && !saving

  function toggleDiet(diet: string) {
    setDiets((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet],
    )
  }

  function addMeal() {
    const meal = mealDraft.trim()
    if (meal && !meals.includes(meal)) setMeals([...meals, meal])
    setMealDraft('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || goal === null) return
    setSaving(true)
    // A meal typed but not added still counts.
    const draft = mealDraft.trim()
    await saveProfile({
      dietaryPreferences: diets,
      goal,
      goalNote: goal === 'other' && goalNote.trim() ? goalNote.trim() : undefined,
      favouriteMeals: draft && !meals.includes(draft) ? [...meals, draft] : meals,
      lastNightDinner: lastNight.trim(),
    })
    navigate({ to: '/' })
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-teal-world px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] font-sans text-white">
      <h1 className="font-serif text-3xl leading-tight">
        Tell Watts about your <em className="text-lime">taste</em>
      </h1>
      <p className="mt-2 text-sm text-white/60">
        A few quick questions so dinner fits you.
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-8">
        <Section title="Any dietary preferences?" hint="Pick as many as you like.">
          <div className="flex flex-wrap gap-2">
            {DIETS.map((diet) => (
              <Chip
                key={diet}
                selected={diets.includes(diet)}
                onClick={() => toggleDiet(diet)}
              >
                {diet}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="What’s your goal?">
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <Chip
                key={g.value}
                selected={goal === g.value}
                onClick={() => setGoal(g.value)}
              >
                {g.label}
              </Chip>
            ))}
          </div>
          {goal === 'other' && (
            <input
              value={goalNote}
              onChange={(e) => setGoalNote(e.target.value)}
              placeholder="Tell Watts a bit more"
              className={`${input} mt-3`}
            />
          )}
        </Section>

        <Section title="Favourite meals" hint="Add a few you’d happily eat again.">
          <div className="flex gap-2">
            <input
              value={mealDraft}
              onChange={(e) => setMealDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addMeal()
                }
              }}
              placeholder="e.g. Thai green curry"
              className={input}
            />
            <button
              type="button"
              onClick={addMeal}
              aria-label="Add meal"
              disabled={!mealDraft.trim()}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-lime text-teal-world transition disabled:opacity-40"
            >
              <Plus className="size-5" />
            </button>
          </div>
          {meals.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {meals.map((meal) => (
                <Chip
                  key={meal}
                  selected
                  onClick={() => setMeals(meals.filter((m) => m !== meal))}
                >
                  {meal}
                  <X className="size-3.5" aria-label={`Remove ${meal}`} />
                </Chip>
              ))}
            </div>
          )}
        </Section>

        <Section title="What did you have for dinner last night?">
          <input
            value={lastNight}
            onChange={(e) => setLastNight(e.target.value)}
            placeholder="e.g. Leftover pizza"
            className={input}
          />
        </Section>

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-14 w-full rounded-full bg-lime text-base font-semibold text-teal-world transition active:scale-[0.98] disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Let’s eat'}
        </button>
      </form>
    </main>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="font-serif text-xl">{title}</h2>
      {hint && <p className="mt-1 text-xs text-white/50">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}
