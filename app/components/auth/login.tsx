import { useOutletContext } from '@remix-run/react'
import type { Session, SupabaseClient } from '@supabase/auth-helpers-remix'
import { cn } from '~/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Icons } from '~/components/icons'
import * as React from 'react'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

interface LoginProps extends React.HTMLAttributes<HTMLDivElement> {}

const Login: React.FC<LoginProps> = ({ className, ...props }) => {
  const { supabase, user } = useOutletContext<{
    supabase: SupabaseClient<Database>
    user: Session['user'] | null
  }>()

  const [userEmail, setUserEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleEmailLogin = async () => {
    await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password,
    })
    // unset values
    setUserEmail('')
    setPassword('')
  }

  const handleSignup = async () => {
    await supabase.auth.signUp({
      email: userEmail,
      password: password,
    })
    // unset values
    setUserEmail('')
    setPassword('')
  }

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
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      ) : (
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className={cn('mx-auto max-w-sm', className)} {...props}>
              <CardHeader>
                <CardTitle className="text-center text-2xl font-extrabold tracking-wide">
                  Login
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-6">
                  <Button variant="outline" onClick={handleLoginGoogle}>
                    <Icons.Google className="mr-2 h-4 w-4" /> Google
                  </Button>
                  <Button variant="outline" onClick={handleLoginGithub}>
                    <Icons.GitHub className="mr-2 h-4 w-4" /> Github
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="m@example.com"
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleEmailLogin}
                  className="w-full"
                  disabled={userEmail.length < 3 || password.length < 3}
                >
                  Login
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className={cn('mx-auto max-w-sm', className)} {...props}>
              <CardHeader>
                <CardTitle className="text-center text-2xl font-extrabold tracking-wide">
                  Create an account
                </CardTitle>
                <CardDescription>
                  Enter your email below to create your account
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="m@example.com"
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSignup}
                  className="w-full"
                  disabled={userEmail.length < 3 || password.length < 3}
                >
                  Create account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </>
  )
}

export { Login }
