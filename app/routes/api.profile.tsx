import type { ActionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { createServerClient } from '@supabase/auth-helpers-remix'
export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const response = new Response()
  const newProfileData = Object.fromEntries(formData.entries())

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

  try {
    await supabase
      .from('profiles')
      .update({
        name: String(newProfileData.name),
        first_name: String(newProfileData.first_name),
        last_name: String(newProfileData.last_name),
        website: String(newProfileData.website),
        description: String(newProfileData.description),
      })
      .eq('id', String(user.id))

    return json({ error: null, ok: true })
  } catch (error: any) {
    return json({ error: error.message, ok: false })
  }
}
