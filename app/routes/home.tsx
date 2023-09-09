import {
  BookmarkIcon,
  ChatBubbleIcon,
  CopyIcon,
  HeartIcon,
  UploadIcon,
} from '@radix-ui/react-icons'
import type { LoaderArgs, ActionArgs, V2_MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { createServerClient } from '@supabase/auth-helpers-remix'
import { NewTweet } from '~/components/new-tweet'
import { Button, buttonVariants } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Separator } from '~/components/ui/separator'
import { cn } from '~/lib/utils'

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Remix Supabase Tweets' },
    { name: 'description', content: 'Welcome to Remix Supabase Tweets!' },
  ]
}

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response()
  const supabase = await createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return redirect('/login')
  }

  const { data } = await supabase
    .from('tweets')
    .select('*, profiles(*), likes(*), comments(id)')
    .order('created_at', { ascending: false })

  const tweets =
    data?.map((tweet) => ({
      ...tweet,
      profiles: tweet.profiles ?? null,
      likes: tweet.likes.length,
      user_has_liked_tweet: tweet.likes.find(
        (like) => like.user_id === session?.user?.id
      )
        ? true
        : false,
    })) ?? []

  return json({ tweets: tweets, user: session?.user })
}
export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const response = new Response()
  const updateLikeData = String(formData.get('tweet_id'))
  const hasLiked = formData.get('has_liked')
  const supabase = await createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    if (hasLiked === 'true') {
      await supabase
        .from('likes')
        .delete()
        .match({ user_id: user.id, tweet_id: updateLikeData })
    } else {
      const { data, error } = await supabase
        .from('likes')
        .insert({ user_id: user.id, tweet_id: updateLikeData })

      console.log({ data, error })
    }
    return redirect(`/home`)
  }

  return redirect(`/home`)
}

export default function Home() {
  const { tweets, user } = useLoaderData<typeof loader>()

  return (
    <>
      <div className="sticky top-0 h-16 border-b bg-background/5 backdrop-blur">
        {user ? (
          <div className="p-4">
            <h1 className="text-lg font-extrabold">Home</h1>
          </div>
        ) : null}
      </div>
      <main className="py-10">
        <div className="mt-4 space-y-2 divide-y border-b">
          <NewTweet user={user} />
          {tweets?.map((tweet) => (
            <div key={tweet.id} className="pb-2 pt-3">
              <div className="pl-4">
                <div className="flex items-start">
                  <div className="w-12 shrink-0">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-primary/5 text-primary-foreground ring-1 ring-offset-2">
                      {tweet?.profiles?.avatar_url ? (
                        <img
                          src={tweet.profiles.avatar_url}
                          alt={tweet.profiles.name}
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div>
                      <Link to={`/tweet/${tweet.id}`}>{tweet.content}</Link>
                      {/* <pre>{JSON.stringify(tweet, null, 2)}</pre> */}
                    </div>
                    <Separator className="mt-2" />
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-secondary-foreground">
                        <Link
                          to={`/tweet/${tweet.id}#comments`}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'sm' }),
                            'space-x-1'
                          )}
                        >
                          <span>{tweet.comments.length}</span>{' '}
                          <ChatBubbleIcon />
                        </Link>
                      </div>
                      {/* <div className="text-sm text-secondary-foreground">
                    <Button variant="ghost" size="sm" className="space-x-1">
                      <span>{tweet.likes}</span> <ReloadIcon />
                    </Button>
                  </div> */}
                      <div className="text-sm text-secondary-foreground">
                        <Form method="POST">
                          <input
                            type="hidden"
                            name="tweet_id"
                            value={tweet.id}
                          />
                          <input
                            type="hidden"
                            name="has_liked"
                            value={
                              tweet.user_has_liked_tweet ? 'true' : 'false'
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="space-x-1"
                          >
                            <span>{tweet.likes}</span>{' '}
                            <HeartIcon
                              className={cn(
                                tweet.user_has_liked_tweet
                                  ? ' text-destructive'
                                  : ''
                              )}
                            />
                          </Button>
                        </Form>
                      </div>
                      {/* <div className="text-sm text-secondary-foreground">
                    <Button variant="ghost" size="sm" className="space-x-1">
                      <span>{tweet.likes}</span> <BarChartIcon />
                    </Button>
                  </div> */}
                      <div className="pr-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <UploadIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64" align="end">
                            <div className="grid gap-4">
                              <div className="inline-flex items-center space-x-1.5 text-sm">
                                <CopyIcon />
                                <span>Copy link to tweet</span>
                              </div>
                              <div className="inline-flex items-center space-x-1.5 text-sm">
                                <BookmarkIcon /> <span>Add to bookmarks</span>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
