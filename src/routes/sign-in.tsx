import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { authClient } from '../auth-client'

export const Route = createFileRoute('/sign-in')({ component: SignIn })

// Plain on purpose: Michael can style it later.
function SignIn() {
  const [error, setError] = useState<string | null>(null)

  async function signIn() {
    setError(null)
    const { error } = await authClient.signIn.social({ provider: 'google', callbackURL: '/' })
    if (error) setError(error.message ?? 'Sign-in failed. Please try again.')
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Watts for Dinner</h1>
      <button type="button" onClick={signIn} className="border px-4 py-2">
        Continue with Google
      </button>
      {error && <p role="alert">{error}</p>}
      <a href="/privacy" className="text-sm underline">
        Privacy policy
      </a>
    </main>
  )
}
