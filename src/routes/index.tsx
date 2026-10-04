import { createFileRoute } from '@tanstack/react-router'

import { StatsCard } from '#/components/StatsCard'
import { ChatFlow } from '#/components/chat/ChatFlow'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col bg-teal-world font-sans text-white">
      <header className="shrink-0 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Placeholder numbers until Whoop data is wired up. */}
        <StatsCard recovery={68} strain={11.4} mealPref="High protein" />
      </header>

      <section className="relative min-h-0 flex-1 overflow-hidden">
        {/* Chat gets the whole area; the Watts 3D scene (michael/watts-scene) can sit behind it. */}
        <div className="absolute inset-0 bg-radial from-card/60 to-transparent" />

        <div className="absolute inset-0">
          <ChatFlow />
        </div>
      </section>
    </main>
  )
}
