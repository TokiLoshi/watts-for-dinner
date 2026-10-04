import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-5xl font-bold">Watts for Dinner</h1>
    </main>
  )
}
