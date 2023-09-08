import { Outlet, useOutletContext } from '@remix-run/react'
import type { SupabaseClient } from '@supabase/auth-helpers-remix'

export default function AuthLayout() {
  const { supabase } = useOutletContext<{
    supabase: SupabaseClient<Database>
  }>()
  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-foreground to-primary-foreground/50" />
      <Outlet context={{ supabase }} />
    </div>
  )
}
