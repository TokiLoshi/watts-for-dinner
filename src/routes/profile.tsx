import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Check, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'

import { authClient } from '#/auth-client'
import { getRecoverySummary } from '#/server/recovery'

export const Route = createFileRoute('/profile')({ component: ProfilePage })

const row =
  'flex min-h-16 w-full items-center gap-4 rounded-3xl border border-white/10 bg-card/80 px-4 py-3 backdrop-blur-xl'

function ProfilePage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const user = session?.user
  // null while loading.
  const [whoopConnected, setWhoopConnected] = useState<boolean | null>(null)

  useEffect(() => {
    let live = true
    getRecoverySummary()
      .then((s) => live && setWhoopConnected(s.connected))
      .catch((err) => {
        console.error('getRecoverySummary failed', err)
        if (live) setWhoopConnected(false)
      })
    return () => {
      live = false
    }
  }, [])

  async function signOut() {
    await authClient.signOut()
    navigate({ to: '/sign-in' })
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-teal-world px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] font-sans text-white">
      <Link
        to="/"
        aria-label="Back"
        className="-ml-2 flex size-11 items-center justify-center rounded-full text-white/70 transition active:scale-95"
      >
        <ChevronLeft className="size-6" />
      </Link>

      <h1 className="mt-6 mb-8 font-serif text-3xl leading-tight">
        Your <em className="text-lime">profile</em>
      </h1>

      <div className="flex flex-col gap-3">
        <Link to="/onboarding" className={`${row} transition active:scale-[0.98]`}>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-lime/15">
            <SlidersHorizontal className="size-5 text-lime" />
          </span>
          <span className="flex-1">
            <span className="block text-base font-medium">Preferences</span>
            <span className="block text-sm text-white/60">Diet, goal, favourite meals</span>
          </span>
          <ChevronRight className="size-5 text-white/50" />
        </Link>

        <div className={row}>
          {user?.image ? (
            <img
              src={user.image}
              alt=""
              referrerPolicy="no-referrer"
              className="size-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-lime/15 font-serif text-lg text-lime">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-white/60">Google account</span>
            <span className="block truncate text-base font-medium">{user?.name ?? 'Not signed in'}</span>
          </span>
          {user && (
            <button
              type="button"
              onClick={signOut}
              className="min-h-11 shrink-0 rounded-full border border-white/25 px-4 text-sm text-white/80 transition active:scale-95"
            >
              Sign out
            </button>
          )}
        </div>

        <div className={row}>
          <span className="flex-1">
            <span className="block text-base font-medium">Whoop</span>
            <span className="block text-sm text-white/60">Recovery and strain</span>
          </span>
          {whoopConnected === true && (
            <span className="flex min-h-9 items-center gap-1.5 rounded-full bg-lime/15 px-3 text-sm text-lime">
              <Check className="size-4" />
              Connected
            </span>
          )}
          {whoopConnected === false && (
            <a
              href="/api/whoop/connect"
              className="flex min-h-11 items-center rounded-full bg-lime px-5 text-sm font-semibold text-teal-world transition active:scale-95"
            >
              Connect
            </a>
          )}
        </div>
      </div>
    </main>
  )
}
