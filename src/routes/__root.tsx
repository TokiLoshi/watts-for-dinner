import { HeadContent, Scripts, createRootRoute, redirect } from '@tanstack/react-router'

import { getSessionUser } from '../server/session'
import appCss from '../styles.css?url'

// Pages anyone can see. Everything else needs a signed-in user.
const PUBLIC_PATHS = ['/sign-in', '/privacy']

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (PUBLIC_PATHS.includes(location.pathname)) return
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/sign-in' })
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
        {children}

        <Scripts />
      </body>
    </html>
  )
}
