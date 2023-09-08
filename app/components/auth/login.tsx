import { useOutletContext } from '@remix-run/react'
import type { SupabaseClient } from '@supabase/auth-helpers-remix'
import { cn } from '~/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

interface LoginProps extends React.HTMLAttributes<HTMLDivElement> {}

const Login: React.FC<LoginProps> = ({ className, ...props }) => {
  const { supabase } = useOutletContext<{
    supabase: SupabaseClient<Database>
  }>()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <Card className={cn('mx-auto max-w-sm', className)} {...props}>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleLogin}>Anmelden</Button>
        <Button onClick={handleLogout}>Abmelden</Button>
      </CardContent>
    </Card>
  )
}

export { Login }
