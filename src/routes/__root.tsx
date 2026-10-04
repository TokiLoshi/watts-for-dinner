import { HeadContent, Scripts, createRootRoute, redirect } from '@tanstack/react-router'

import { getSessionUser } from '../server/session'
import { SparklesBackground } from './-sparkles-bg'
import appCss from '../styles.css?url'

// Pages anyone can see. Everything else needs a signed-in user.
const PUBLIC_PATHS = ['/sign-in', '/privacy']

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (PUBLIC_PATHS.includes(location.pathname)) return
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/sign-in' })
    // New users (no saved profile yet) go through onboarding first.
    const onOnboarding = location.pathname === '/onboarding' || location.pathname.startsWith('/onboarding/')
    if (!user.hasProfile && !onOnboarding) throw redirect({ to: '/onboarding' })
    return { user }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Watts for Dinner',
      },
    ],
    links: [
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <SparklesBackground />
        {/* Content stacks above the sparkles canvas (z-0). */}
        <div className="relative z-10">{children}</div>

        <Scripts />
      </body>
    </html>
  )
}
