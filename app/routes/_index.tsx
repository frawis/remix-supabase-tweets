import { type V2_MetaFunction } from '@remix-run/node'
import { useNavigate, useOutletContext } from '@remix-run/react'
import type { Session } from '@supabase/auth-helpers-remix'
import { useEffect } from 'react'
import { Login } from '~/components/auth/login'
import { Logo } from '~/components/logo'

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Remix Supabase Tweets' },
    { name: 'description', content: 'Welcome to Remix Supabase Tweets!' },
  ]
}

export default function Index() {
  const { user } = useOutletContext<{
    user: Session['user'] | null
  }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/home')
    }
  }, [user, navigate])

  return (
    <div className="py-8">
      <div className="space-y-4 px-4">
        <div className="flex justify-center">
          <Logo className="h-12 w-12" />
        </div>
        <h1 className="text-center text-4xl font-extrabold">
          Remix Supabase Tweets
        </h1>
        <p className="text-center text-lg/6 text-secondary-foreground">
          Welcome to Remix Supabase Tweets! This is a demo app to show how to
          use Remix and Supabase together.
        </p>
        <p className="text-center text-muted-foreground">
          To get started, click the button below to login with your Google or
          GitHub account.
        </p>
      </div>
      <div className="mt-8">
        <Login />
      </div>
    </div>
  )
}
