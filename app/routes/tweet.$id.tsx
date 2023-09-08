import { ChevronLeftIcon } from '@radix-ui/react-icons'
import { json, redirect, type LoaderArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { createServerClient } from '@supabase/auth-helpers-remix'
import { buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'
export async function loader({ request, params }: LoaderArgs) {
  const tweetId = await params.id

  const response = new Response()
  const supabase = await createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session || tweetId === null) {
    return redirect('/login')
  }

  const { data } = await supabase
    .from('tweets')
    .select('*, profiles(*), likes(*), comments(*)')
    .eq('id', String(tweetId))
    .single()

  return json({ tweet: data })
}

export default function SingleTweet() {
  const { tweet } = useLoaderData<typeof loader>()
  console.log(tweet)
  return (
    <div className="min-h-screen">
      <div className="border-y py-2">
        <Link
          to="/home"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Back</span>
        </Link>
      </div>
      {tweet ? <p>{tweet.content}</p> : <p>loading...</p>}
      {tweet?.comments ? (
        <div id="comments" className=" scroll-mt-20">
          <div>
            <p>New Comment</p>
          </div>
          {tweet.comments.map((comment) => (
            <div key={comment.id}>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
