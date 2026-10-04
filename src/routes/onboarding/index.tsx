import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

import { Chip } from '#/components/onboarding/Chip'
import { saveProfile } from '#/server/profile'
import type { Profile } from '#/server/profile'

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

const MAX_MEALS = 5
const STEPS = 4

const input =
  'h-14 w-full rounded-2xl border border-white/15 bg-card/80 px-4 text-base text-white placeholder:text-white/40 focus:border-lime focus:outline-none'

function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [diets, setDiets] = useState<string[]>([])
  const [otherDiet, setOtherDiet] = useState<string | null>(null)
  const [goal, setGoal] = useState<Profile['goal'] | null>(null)
  const [goalNote, setGoalNote] = useState('')
  const [meals, setMeals] = useState<string[]>(Array(MAX_MEALS).fill(''))
  const [lastNight, setLastNight] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filledMeals = meals.map((m) => m.trim()).filter(Boolean)
  const canContinue = [
    true,
    goal !== null,
    filledMeals.length > 0,
    lastNight.trim() !== '' && !saving,
  ][step]

  function toggleDiet(diet: string) {
    setDiets((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet],
    )
  }

  async function finish() {
    if (goal === null) return
    const other = otherDiet?.trim()
    const note = goalNote.trim()
    const profile: Profile = {
      dietaryPreferences: other ? [...diets, other] : diets,
      goal,
      ...(goal === 'other' && note ? { goalNote: note } : {}),
      favouriteMeals: [...new Set(filledMeals)],
      lastNightDinner: lastNight.trim(),
    }
    setSaving(true)
    setError(null)
    try {
      await saveProfile({ data: profile })
      navigate({ to: '/' })
    } catch (err) {
      console.error('saveProfile failed', err)
      setError('Watts couldn’t save that. Try again?')
      setSaving(false)
    }
  }

  function next(e: React.FormEvent) {
    e.preventDefault()
    if (!canContinue) return
    if (step < STEPS - 1) setStep(step + 1)
    else void finish()
  }

  const isLast = step === STEPS - 1
  const buttonLabel = isLast
    ? saving
      ? 'Saving…'
      : 'Let’s eat'
    : step === 0 && diets.length === 0 && !otherDiet?.trim()
      ? 'No preferences'
      : 'Next'

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-teal-world px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] font-sans text-white">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          aria-label="Back"
          className={`-ml-2 flex size-10 items-center justify-center rounded-full text-white/70 transition active:scale-95 ${step === 0 ? 'invisible' : ''}`}
        >
          <ChevronLeft className="size-6" />
        </button>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS}
          aria-valuenow={step + 1}
          aria-label={`Question ${step + 1} of ${STEPS}`}
          className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-lime transition-[width] duration-300"
            style={{ width: `${((step + 1) / STEPS) * 100}%` }}
          />
        </div>
        <div className="size-10" />
      </div>

      <form onSubmit={next} className="flex flex-1 flex-col">
        <div key={step} className="mt-10 flex-1">
          {step === 0 && (
            <>
              <Question hint="Pick as many as you like.">
                Any dietary <em>preferences</em>?
              </Question>
              <div className="flex flex-wrap gap-2.5">
                {DIETS.map((diet) => (
                  <Chip
                    key={diet}
                    selected={diets.includes(diet)}
                    onClick={() => toggleDiet(diet)}
                  >
                    {diet}
                  </Chip>
                ))}
                <Chip
                  selected={otherDiet !== null}
                  onClick={() => setOtherDiet(otherDiet === null ? '' : null)}
                >
                  Other
                </Chip>
              </div>
              {otherDiet !== null && (
                <input
                  autoFocus
                  value={otherDiet}
                  onChange={(e) => setOtherDiet(e.target.value)}
                  placeholder="e.g. No mushrooms"
                  aria-label="Other dietary preference"
                  className={`${input} mt-4`}
                />
              )}
            </>
          )}

          {step === 1 && (
            <>
              <Question>
                What’s your <em>goal</em>?
              </Question>
              <div className="flex flex-wrap gap-2.5">
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
                  autoFocus
                  value={goalNote}
                  onChange={(e) => setGoalNote(e.target.value)}
                  placeholder="Tell Watts a bit more"
                  aria-label="Goal note"
                  className={`${input} mt-4`}
                />
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Question hint="Up to five you’d happily eat again.">
                Your top five <em>favourite</em> meals?
              </Question>
              <div className="flex flex-col gap-2.5">
                {meals.map((meal, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-4 text-right font-serif text-lg text-lime">
                      {i + 1}
                    </span>
                    <input
                      autoFocus={i === 0}
                      value={meal}
                      onChange={(e) =>
                        setMeals(meals.map((m, j) => (j === i ? e.target.value : m)))
                      }
                      placeholder={i === 0 ? 'e.g. Thai green curry' : ''}
                      aria-label={`Favourite meal ${i + 1}`}
                      className={input}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Question>
                What did you have for <em>dinner</em> last night?
              </Question>
              <input
                autoFocus
                value={lastNight}
                onChange={(e) => setLastNight(e.target.value)}
                placeholder="e.g. Leftover pizza"
                aria-label="Last night’s dinner"
                className={input}
              />
            </>
          )}
        </div>

        {error && (
          <p role="alert" className="mb-3 text-center text-sm text-strain">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!canContinue}
          className="h-14 w-full rounded-full bg-lime text-base font-semibold text-teal-world transition active:scale-[0.98] disabled:opacity-40"
        >
          {buttonLabel}
        </button>
      </form>
    </main>
  )
}

/** Fraunces question; wrap the one highlight word in <em>. */
function Question({ hint, children }: { hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="font-serif text-3xl leading-tight [&_em]:text-lime">{children}</h1>
      {hint && <p className="mt-2 text-sm text-white/60">{hint}</p>}
    </div>
  )
}
