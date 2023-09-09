import { Login } from '~/components/auth/login'
import { Logo } from '~/components/logo'

export default function LoginPage() {
  return (
    <div className="relative w-full max-w-sm px-4">
      <div className="grid gap-4">
        <Logo className="mx-auto h-12 w-12" />
        <h1 className="text-center text-2xl font-extrabold lg:text-4xl">
          Remix Supabase Tweets
        </h1>
      </div>
      <div className="mt-4">
        <Login />
      </div>
    </div>
  )
}
