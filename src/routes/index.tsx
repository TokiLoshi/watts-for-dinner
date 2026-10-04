import { createFileRoute } from '@tanstack/react-router'

import { MessageBar } from '#/components/MessageBar'
import { StatsCard } from '#/components/StatsCard'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col bg-teal-world font-sans text-white">
      <header className="basis-1/3 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Placeholder numbers until Whoop data is wired up. */}
        <StatsCard recovery={68} strain={11.4} mealPref="High protein" />
      </header>

      <section className="relative basis-2/3 overflow-hidden">
        {/* Watts 3D scene goes here (michael/watts-scene). */}
        <div className="absolute inset-0 bg-radial from-card/60 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <MessageBar
            onSend={(text) => console.log('send', text)}
            onPhoto={(file) => console.log('photo', file.name)}
          />
        </div>
      </section>
    </main>
  )
}
