import {
  ArrowLeftIcon,
  BookmarkIcon,
  ChatBubbleIcon,
  CopyIcon,
  HeartIcon,
  TwitterLogoIcon,
  UploadIcon,
} from '@radix-ui/react-icons'
import { PopoverTrigger } from '@radix-ui/react-popover'
import { TabsContent } from '@radix-ui/react-tabs'
import { json, redirect } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'
import { Link, useLoaderData, useOutletContext } from '@remix-run/react'
import type { Session } from '@supabase/auth-helpers-remix'
import { createServerClient } from '@supabase/auth-helpers-remix'
import { EditProfile } from '~/components/edit-profile'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardFooter } from '~/components/ui/card'
import { Popover, PopoverContent } from '~/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { cn } from '~/lib/utils'

export async function loader({ request, params }: LoaderArgs) {
  const profileId = await params.id

  const response = new Response()
  const supabase = await createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session || profileId === null) {
    return redirect('/login')
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', String(profileId))
    .single()

  const { data: tweetsData } = await supabase
    .from('tweets')
    .select('*, comments(id), likes(*), profiles(*)')
    .eq('user_id', String(profileId))
    .order('created_at', { ascending: false })

  const tweets =
    tweetsData?.map((tweet) => ({
      ...tweet,
      profiles: tweet.profiles ?? null,
      likes: tweet.likes.length,
      user_has_liked_tweet: tweet.likes.find(
        (like) => like.user_id === session?.user?.id
      )
        ? true
        : false,
    })) ?? []

  return json({ profile: data, tweets: tweets })
}

export default function SingleTweet() {
  const { profile, tweets } = useLoaderData<typeof loader>()
  const { user } = useOutletContext<{
    user: Session['user'] | null
  }>()

  return (
    <>
      <div className="sticky top-0 z-30 h-16 border-b bg-background/5 backdrop-blur">
        {user ? (
          <div className="p-4">
            <div className="flex items-center gap-x-2">
              <Link
                to="/home"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'rounded-full'
                )}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-lg font-extrabold">
                {profile?.name ?? 'Profile'}
              </h1>
            </div>
          </div>
        ) : null}
      </div>
      <main className="pb-4">
        <div className="relative z-0">
          {profile?.header_url ? (
            <div>
              <div>Here the Image</div>
            </div>
          ) : (
            <div className="h-32 bg-muted lg:h-48" />
          )}
          <div className="flex items-center justify-between px-4">
            {profile?.avatar_url ? (
              <div className="-mt-10 lg:-mt-14">
                <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-ring ring-offset-2 lg:h-28 lg:w-28">
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="absolute"></div>
            )}
            <div className="mt-2">
              <EditProfile profile={profile} />
            </div>
          </div>
          <div>
            {profile?.first_name && profile?.last_name ? (
              <div className="px-4">
                <div className="text-2xl font-bold">
                  {profile.first_name} {profile.last_name}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {tweets ? (
          <div className="mt-4 px-4">
            <Tabs defaultValue="tweets">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tweets">
                  <TwitterLogoIcon className="mr-1 h-4 w-4" />
                  Tweets
                </TabsTrigger>
                <TabsTrigger value="likes">
                  <HeartIcon className="mr-1 h-4 w-4" />
                  Likes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="tweets">
                <div className="mt-4 space-y-4">
                  {tweets?.map((tweet) => (
                    <Card key={tweet.id}>
                      <CardContent className="pt-4">
                        {tweet.content}
                      </CardContent>
                      <CardFooter>
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
                              <span>{tweet.comments.length}</span>{' '}
                              <ChatBubbleIcon />
                            </Link>
                          </div>
                          <div className="text-sm text-secondary-foreground">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="space-x-1"
                            >
                              <span>{String(tweet.likes)}</span>{' '}
                              <HeartIcon
                                className={cn(
                                  tweet.user_has_liked_tweet
                                    ? 'text-red-500'
                                    : 'text-secondary-foreground'
                                )}
                              />
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
                                    <BookmarkIcon />{' '}
                                    <span>Add to bookmarks</span>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div>
            <div>No Tweets</div>
          </div>
        )}
      </main>
    </>
  )
}
