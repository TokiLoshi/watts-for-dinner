import { Suspense, lazy, useEffect, useState } from 'react'

// three.js only loads in the browser, after the page is up.
const SparklesScene = lazy(() => import('./-sparkles-scene'))

/** Full-screen orange sparkles behind the page content. Off for prefers-reduced-motion. */
export function SparklesBackground() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setShow(!reduced.matches)
    update()
    reduced.addEventListener('change', update)
    return () => reduced.removeEventListener('change', update)
  }, [])

  if (!show) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <Suspense fallback={null}>
        <SparklesScene />
      </Suspense>
    </div>
  )
}
