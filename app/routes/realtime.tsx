import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData, useOutletContext } from '@remix-run/react'
import type { SupabaseClient } from '@supabase/auth-helpers-remix'
import { createServerClient } from '@supabase/auth-helpers-remix'
import { useEffect, useState } from 'react'

type Tweet = Database['public']['Tables']['tweets']['Row']

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response()
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )
  const { data } = await supabase.from('tweets').select('*')

  return json({ serverTweets: data ?? [] }, { headers: response.headers })
}

export default function Realtime() {
  const { serverTweets } = useLoaderData<typeof loader>()
  const [tweets, setTweets] = useState(serverTweets)
  const { supabase } = useOutletContext<{
    supabase: SupabaseClient<Database>
  }>()

  useEffect(() => {
    setTweets(serverTweets)
  }, [serverTweets])

  useEffect(() => {
    const channel = supabase
      .channel('*')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => setTweets([...tweets, payload.new as Tweet])
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tweets])

  return (
    <div>
      <h1>Realtime</h1>
      <div>
        <pre>
          <code>{JSON.stringify(tweets, null, 2)}</code>
        </pre>
      </div>
    </div>
  )
}
