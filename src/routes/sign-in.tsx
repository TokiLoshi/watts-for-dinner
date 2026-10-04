import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { authClient } from '../auth-client'

export const Route = createFileRoute('/sign-in')({ component: SignIn })

const WHAT_WATTS_DOES = [
  { icon: '💚', text: 'Reads your WHOOP recovery, so dinner matches how you actually feel.' },
  { icon: '📸', text: 'Looks in your fridge from one photo.' },
  { icon: '🍳', text: 'Suggests three recipes that fit your energy tonight.' },
  { icon: '⭐', text: 'Remembers the meals you loved, and skips the ones you didn’t.' },
]

function SignIn() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function signIn() {
    setError(null)
    setBusy(true)
    const { error } = await authClient.signIn.social({ provider: 'google', callbackURL: '/' })
    // On success the browser is already heading to Google, so only reset on error.
    if (error) {
      setError(error.message ?? 'Sign-in didn’t work. Please try again.')
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-5 py-10 font-sans text-cream">
      <header className="flex flex-col gap-2 text-center">
        <span className="text-5xl" aria-hidden="true">
          🥔
        </span>
        <h1 className="font-serif text-4xl font-semibold text-cream">Watts for Dinner</h1>
        <p className="text-lg text-cream/85">Your cheeky potato chef and coach.</p>
      </header>

      <section aria-label="What Watts does" className="rounded-2xl border border-white/10 bg-card px-5 py-4">
        <ul className="flex flex-col gap-3 text-base leading-relaxed">
          {WHAT_WATTS_DOES.map((item) => (
            <li key={item.text} className="flex gap-3">
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={signIn}
          disabled={busy}
          className="min-h-14 w-full rounded-full bg-cream px-6 text-lg font-semibold text-teal-world transition hover:bg-white disabled:opacity-70"
        >
          {busy ? 'Opening Google…' : 'Continue with Google'}
        </button>
        {error && (
          <p role="alert" className="rounded-xl bg-strain/15 px-4 py-2 text-center text-base text-cream">
            {error}
          </p>
        )}
        <p className="text-center text-sm text-cream/75">
          We only use your data to cook for you.{' '}
          <a href="/privacy" className="font-medium text-lime underline underline-offset-2">
            Privacy policy
          </a>
        </p>
      </div>
    </main>
  )
}
