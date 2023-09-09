import { useOutletContext } from '@remix-run/react'
import type { Session, SupabaseClient } from '@supabase/auth-helpers-remix'
import { cn } from '~/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

interface LoginProps extends React.HTMLAttributes<HTMLDivElement> {}

const Login: React.FC<LoginProps> = ({ className, ...props }) => {
  const { supabase, user } = useOutletContext<{
    supabase: SupabaseClient<Database>
    user: Session['user'] | null
  }>()

  const handleLoginGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleLoginGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      {user ? (
        <div>
          <Button onClick={handleLogout}>Abmelden</Button>
        </div>
      ) : (
        <Card className={cn('mx-auto max-w-sm', className)} {...props}>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLoginGoogle}>Login with Google</Button>
            <Button onClick={handleLoginGithub}>Login with Github</Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export { Login }
