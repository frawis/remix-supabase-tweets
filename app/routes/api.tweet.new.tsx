import type { ActionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { createServerClient } from '@supabase/auth-helpers-remix'
export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const response = new Response()

  const supabase = await createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  await supabase.from('tweets').insert([
    {
      user_id: user.id,
      content: String(formData.get('content')),
    },
  ])

  return redirect(`/home`, { headers: response.headers })
}
