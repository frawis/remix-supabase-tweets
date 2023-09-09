import {
  ArrowLeftIcon,
  BookmarkIcon,
  ChatBubbleIcon,
  CopyIcon,
  HeartIcon,
  UploadIcon,
} from '@radix-ui/react-icons'
import { json, redirect, type LoaderArgs } from '@remix-run/node'
import { Link, useLoaderData, useOutletContext } from '@remix-run/react'
import type { Session } from '@supabase/auth-helpers-remix'
import { createServerClient } from '@supabase/auth-helpers-remix'
import { format, formatDistanceToNow } from 'date-fns'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardFooter } from '~/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Textarea } from '~/components/ui/textarea'
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
    .select('*, profiles(*), likes(*), comments(*, profiles(*))')
    .eq('id', String(tweetId))
    .order('created_at', { foreignTable: 'comments', ascending: false })
    .single()

  return json({ tweet: data })
}

export default function SingleTweet() {
  const { tweet } = useLoaderData<typeof loader>()
  const { user } = useOutletContext<{
    user: Session['user'] | null
  }>()

  return (
    <>
      <div className="sticky top-0 z-30 border-b bg-background/5 backdrop-blur">
        <div className="flex h-16 items-center gap-x-2 p-4">
          <Link
            to="/home"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'rounded-full'
            )}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-extrabold">Post</h1>
        </div>
      </div>
      <main className="p-4">
        {tweet ? (
          <Card>
            <CardContent className="pt-4">
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
                <div className="flex-1">{tweet.content}</div>
              </div>
            </CardContent>
            <CardFooter className="pl-14">
              <div className="flex w-full items-center justify-between">
                <div className="text-sm text-secondary-foreground">
                  <Link
                    to={`/tweet/${tweet.id}#comments`}
                    className={cn(
                      buttonVariants({
                        variant: 'ghost',
                        size: 'sm',
                      }),
                      'space-x-1'
                    )}
                  >
                    <span>{tweet.comments.length}</span> <ChatBubbleIcon />
                  </Link>
                </div>
                <div className="text-sm text-secondary-foreground">
                  <Button variant="ghost" size="sm" className="space-x-1">
                    <span>{String(tweet.likes.length)}</span>{' '}
                    <HeartIcon className={cn('text-secondary-foreground')} />
                  </Button>
                </div>
                <div>
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
            </CardFooter>
          </Card>
        ) : (
          <p>loading...</p>
        )}
        {tweet?.comments ? (
          <div id="comments" className=" scroll-mt-20">
            <div className="mt-6 flex gap-x-3">
              <img
                src={user?.user_metadata?.avatar_url}
                alt=""
                className="h-6 w-6 flex-none rounded-full bg-gray-50"
              />
              <form action="#" className="relative flex-auto">
                <div className="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-input focus-within:ring-2 focus-within:ring-primary">
                  <label htmlFor="comment" className="sr-only">
                    Add your comment
                  </label>
                  <Textarea
                    rows={4}
                    name="comment"
                    id="comment"
                    className="block w-full resize-none border-0 bg-transparent py-1.5 focus:ring-0 focus-visible:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Add your comment..."
                    defaultValue={''}
                  />
                </div>

                <div className="absolute inset-x-0 bottom-0 flex justify-between py-3 pb-2 pl-3 pr-2">
                  <div className="flex items-center space-x-5">
                    {/* <div className="flex items-center">
                      <button
                        type="button"
                        className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                      >
                        <PaperClipIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Attach a file</span>
                      </button>
                    </div> */}
                  </div>
                  <Button type="submit" size="sm">
                    Comment
                  </Button>
                </div>
              </form>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold">
                Comments{' '}
                <Badge variant="secondary">{tweet.comments.length}</Badge>
              </h3>
              <ul className="mt-4 space-y-6">
                {tweet.comments.map((comment, commentIdx) => (
                  <li key={comment.id} className="relative flex gap-x-4">
                    <div
                      className={cn(
                        commentIdx === tweet.comments.length - 1
                          ? 'h-8'
                          : '-bottom-8',
                        'absolute left-0 top-0 flex w-8 justify-center'
                      )}
                    >
                      <div className="w-px bg-border" />
                    </div>
                    {comment.profiles ? (
                      <img
                        src={comment.profiles.avatar_url}
                        alt={comment.profiles.name}
                        className="relative mt-3 h-8 w-8 flex-none rounded-full bg-secondary"
                      />
                    ) : null}
                    <div className="flex-auto rounded-md border bg-card p-3 text-card-foreground shadow">
                      <div className="flex justify-between gap-x-4">
                        <div className="py-0.5 text-sm leading-5 text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {comment?.profiles?.name}
                          </span>{' '}
                          commented
                        </div>
                        <time
                          dateTime={comment.created_at}
                          className="flex-none py-0.5 text-xs leading-5 text-muted-foreground"
                        >
                          {Number(
                            formatDistanceToNow(new Date(comment.created_at))
                          ) < 1
                            ? formatDistanceToNow(
                                new Date(comment.created_at)
                              ) + ' ago'
                            : format(
                                new Date(comment.created_at),
                                'dd. MMM. yy'
                              )}
                        </time>
                      </div>
                      <p className="leading-6">{comment.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </main>
    </>
  )
}
