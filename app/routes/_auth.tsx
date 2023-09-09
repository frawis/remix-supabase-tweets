import { Outlet, useOutletContext } from '@remix-run/react'
import type { SupabaseClient } from '@supabase/auth-helpers-remix'

export default function AuthLayout() {
  const { supabase } = useOutletContext<{
    supabase: SupabaseClient<Database>
  }>()
  return (
    <div className="relative flex h-full items-center justify-center">
      <Outlet context={{ supabase }} />
    </div>
  )
}
