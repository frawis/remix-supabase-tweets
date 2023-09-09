import { cssBundleHref } from '@remix-run/css-bundle'
import { json } from '@remix-run/node'
import type {
  DataFunctionArgs,
  LinksFunction,
  LoaderArgs,
} from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useFetchers,
  useLoaderData,
  useRevalidator,
} from '@remix-run/react'
import {
  createBrowserClient,
  createServerClient,
} from '@supabase/auth-helpers-remix'
import { useEffect, useState } from 'react'

import styles from '~/styles/tailwind.css'
import fontStyles from '~/styles/font.css'
import { type Theme, setTheme, getTheme } from '~/lib/theme.server'
import { getHints, useHints } from '~/lib/client-hints'
import { useRequestInfo } from '~/lib/request-info'
import { useForm } from '@conform-to/react'
import { parse } from '@conform-to/zod'
import { z } from 'zod'
import { useNonce } from '~/lib/nonce-provider'
import { cn, invariantResponse } from '~/lib/utils'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { ErrorList } from '~/components/forms'
import { TailwindIndicator } from '~/components/tailwind-indicator'
import {
  ExitIcon,
  MoonIcon,
  PersonIcon,
  SunIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons'
import { Logo } from '~/components/logo'
import { Button } from './components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar'
import { Input } from './components/ui/input'

const ThemeFormSchema = z.object({
  theme: z.enum(['light', 'dark']),
})

export const links: LinksFunction = () => [
  { rel: 'preload', as: 'style', href: fontStyles },
  { rel: 'preload', as: 'style', href: styles },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: fontStyles },
  { rel: 'stylesheet', href: styles },
]

export const loader = async ({ request }: LoaderArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  }

  const response = new Response()

  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', String(session?.user.id))
    .single()

  return json(
    {
      env,
      session,
      profile: profile,
      requestInfo: {
        hints: getHints(request),
        userPrefs: {
          theme: getTheme(request),
        },
      },
    },
    {
      headers: response.headers,
    }
  )
}

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData()
  invariantResponse(
    formData.get('intent') === 'update-theme',
    'Invalid intent',
    { status: 400 }
  )
  const submission = parse(formData, {
    schema: ThemeFormSchema,
  })
  if (submission.intent !== 'submit') {
    return json({ status: 'success', submission } as const)
  }
  if (!submission.value) {
    return json({ status: 'error', submission } as const, { status: 400 })
  }
  const { theme } = submission.value

  const responseInit = {
    headers: { 'set-cookie': setTheme(theme) },
  }
  return json({ success: true, submission }, responseInit)
}

function Document({
  children,
  nonce,
  theme = 'light',
  env = {},
}: {
  children: React.ReactNode
  nonce: string
  theme?: Theme
  env?: Record<string, string>
}) {
  return (
    <html lang="en" className={`${theme} h-full overflow-x-hidden font-sans`}>
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Links />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <TailwindIndicator />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  )
}

export default function App() {
  const data = useLoaderData<typeof loader>()
  const { revalidate } = useRevalidator()
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      data.env.SUPABASE_URL!,
      data.env.SUPABASE_ANON_KEY!
    )
  )
  const serverAccessToken = data.session?.access_token
  const user = data.session?.user
  const profile = data?.profile

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event !== 'INITIAL_SESSION' &&
        session?.access_token !== serverAccessToken
      ) {
        // server and client are out of sync.
        revalidate()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [serverAccessToken, supabase, revalidate])
  const theme = useTheme()
  const nonce = useNonce()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <Document nonce={nonce} theme={theme} env={data.env}>
      <div className="flex h-screen flex-col justify-between">
        <div className="h-full xl:container">
          <div className="hidden border-r sm:fixed sm:inset-y-0 sm:z-50 sm:flex sm:w-36 sm:flex-col md:w-56 lg:w-56">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
              <Link
                to={user ? '/home' : '/login'}
                className="flex h-16 shrink-0 items-center"
              >
                <Logo />
              </Link>
              {user ? (
                <nav className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col gap-y-2">
                    <li>
                      <NavLink
                        to="/home"
                        className={({ isActive }) =>
                          cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 tracking-wide',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
                          )
                        }
                      >
                        <TwitterLogoIcon className="h-6 w-6 shrink-0" />
                        <span className="sm:hidden md:block">Tweets</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to={`/profile/${user.id}`}
                        className={({ isActive }) =>
                          cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 tracking-wide',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
                          )
                        }
                      >
                        <PersonIcon className="h-6 w-6 shrink-0" />
                        <span className="sm:hidden md:block">Profile</span>
                      </NavLink>
                    </li>
                    <li className="mt-auto">
                      <div className="flex items-center gap-x-1">
                        {profile ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-x-1"
                              >
                                {profile.avatar_url ? (
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={profile.avatar_url}
                                      alt={profile.name}
                                    />
                                    <AvatarFallback>
                                      {profile?.first_name
                                        ?.slice(0)
                                        .toLocaleUpperCase() +
                                        ' ' +
                                        profile?.last_name
                                          ?.slice(0)
                                          .toLocaleUpperCase() ?? 'N.N.'}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : null}
                                <span>
                                  {profile.name ?? user.email ?? 'N.N.'}
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                              <DropdownMenuItem asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleLogout}
                                  className="w-full justify-start"
                                >
                                  <ExitIcon className="mr-1 h-5 w-5" />
                                  Logout
                                </Button>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                        <ThemeSwitch
                          userPreference={data.requestInfo.userPrefs.theme}
                        />
                      </div>
                    </li>
                  </ul>
                </nav>
              ) : null}
            </div>
          </div>
          <div className="flex h-full sm:pl-36 md:pl-56 lg:pl-56">
            <div className="flex-1">
              <Outlet context={{ supabase, user }} />
            </div>
            {user ? (
              <aside className="hidden border-l lg:block lg:basis-80">
                <div className="bg-gray sticky top-0 h-16">
                  <div className="bg-background p-4">
                    <Input type="search" placeholder="Search..." />
                  </div>
                </div>
                <section className="py-10">
                  <div className="min-h-screen">
                    <div className="p-4">
                      <p>Who to follow</p>
                    </div>
                  </div>
                </section>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </Document>
  )
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {
  const hints = useHints()
  const requestInfo = useRequestInfo()
  const optimisticMode = useOptimisticThemeMode()
  if (optimisticMode) {
    return optimisticMode === 'light' ? hints.theme : optimisticMode
  }
  return requestInfo.userPrefs.theme ?? hints.theme
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
  const fetchers = useFetchers()

  const themeFetcher = fetchers.find(
    (f) => f.formData?.get('intent') === 'update-theme'
  )

  if (themeFetcher && themeFetcher.formData) {
    const submission = parse(themeFetcher.formData, {
      schema: ThemeFormSchema,
    })
    return submission.value?.theme
  }
}

function ThemeSwitch({ userPreference }: { userPreference?: Theme | null }) {
  const fetcher = useFetcher<typeof action>()

  const [form] = useForm({
    id: 'theme-switch',
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: ThemeFormSchema })
    },
  })

  const optimisticMode = useOptimisticThemeMode()
  const mode = optimisticMode ?? userPreference ?? 'light'
  const nextMode = mode === 'light' ? 'dark' : 'light'
  const modeLabel = {
    light: (
      <div>
        <MoonIcon className="h-5 w-5" />
        <span className="sr-only">Light</span>
      </div>
    ),
    dark: (
      <div>
        <SunIcon className="h-5 w-5" />
        <span className="sr-only">Dark</span>
      </div>
    ),
  }

  return (
    <fetcher.Form method="POST" {...form.props}>
      <input type="hidden" name="theme" value={nextMode} />
      <div className="flex gap-2">
        <Button
          name="intent"
          value="update-theme"
          type="submit"
          size="icon"
          variant="ghost"
        >
          {modeLabel[mode]}
        </Button>
      </div>
      <ErrorList errors={form.errors} id={form.errorId} />
    </fetcher.Form>
  )
}

export function ErrorBoundary() {
  // the nonce doesn't rely on the loader so we can access that
  const nonce = useNonce()

  // NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
  // likely failed to run so we have to do the best we can.
  // We could probably do better than this (it's possible the loader did run).
  // This would require a change in Remix.

  // Just make sure your root route never errors out and you'll always be able
  // to give the user a better UX.

  return (
    <Document nonce={nonce}>
      <GeneralErrorBoundary />
    </Document>
  )
}
