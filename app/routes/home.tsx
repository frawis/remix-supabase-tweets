import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import {
  BookmarkIcon,
  ChatBubbleIcon,
  CopyIcon,
  ExitIcon,
  HeartIcon,
  UploadIcon,
} from '@radix-ui/react-icons'
import type { LoaderArgs, ActionArgs, V2_MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useLoaderData, useOutletContext } from '@remix-run/react'
import type { SupabaseClient } from '@supabase/auth-helpers-remix'
import { createServerClient } from '@supabase/auth-helpers-remix'
import { Logo } from '~/components/logo'
import { NewTweet } from '~/components/new-tweet'
import { AvatarFallback } from '~/components/ui/avatar'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardFooter } from '~/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Separator } from '~/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
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

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session?.user?.id)
    .single()

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

  return json({ tweets: tweets, user: session?.user, profile: profileData })
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
      await supabase
        .from('likes')
        .insert({ user_id: user.id, tweet_id: updateLikeData })
    }
    return redirect(`/home`)
  }

  return redirect(`/home`)
}

export default function Home() {
  const { tweets, profile } = useLoaderData<typeof loader>()
  const { supabase } = useOutletContext<{
    supabase: SupabaseClient<Database>
  }>()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <div className="sticky top-0 border-b bg-background/5 backdrop-blur">
        {profile ? (
          <div className="flex h-16 items-center p-4">
            <div className="w-12 shrink-0 md:hidden">
              <Sheet>
                <SheetTrigger>
                  <Avatar>
                    <AvatarImage
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <AvatarFallback>
                      {profile.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader className="text-left">
                    <div className="flex items-center gap-x-2">
                      <div className="shrink-0">
                        <Avatar>
                          <AvatarImage
                            src={profile.avatar_url}
                            alt={profile.name}
                            className="h-8 w-8 rounded-full"
                          />
                          <AvatarFallback>
                            {profile.name.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <SheetTitle>{profile.name}</SheetTitle>
                        <SheetDescription>
                          {profile?.first_name} {profile?.last_name}
                          {profile.username ? `@${profile.username}` : null}
                        </SheetDescription>
                      </div>
                    </div>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <Link
                      to={`/profile/${profile.id}`}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'lg' }),
                        'justify-start text-base'
                      )}
                    >
                      Profile
                    </Link>
                  </div>
                  <SheetFooter className="absolute inset-x-0 bottom-4">
                    <div className="grid gap-4 px-4">
                      <Button variant="outline" onClick={handleLogout}>
                        <ExitIcon className="mr-1" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex flex-1 justify-center pr-12 md:justify-start">
              <h1 className="hidden text-lg font-extrabold md:block">Home</h1>
              <Logo className="h-8 w-8 md:hidden" />
            </div>
          </div>
        ) : null}
      </div>
      <main className="py-10">
        <NewTweet user={profile} />
        <Separator className="mt-4" />
        <div className="mt-4 space-y-4 px-4">
          {tweets?.map((tweet) => (
            <Card key={tweet.id}>
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
                  <div className="flex-1">
                    <div>
                      <Link to={`/tweet/${tweet.id}`}>{tweet.content}</Link>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pl-14">
                <div className="flex w-full items-center justify-between">
                  <div className="text-sm text-secondary-foreground">
                    <Link
                      to={`/tweet/${tweet.id}#comments`}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        'space-x-1'
                      )}
                    >
                      <span>{tweet.comments.length}</span> <ChatBubbleIcon />
                    </Link>
                  </div>
                  <div className="text-sm text-secondary-foreground">
                    <Form method="POST">
                      <input type="hidden" name="tweet_id" value={tweet.id} />
                      <input
                        type="hidden"
                        name="has_liked"
                        value={tweet.user_has_liked_tweet ? 'true' : 'false'}
                      />
                      <Button variant="ghost" size="sm" className="space-x-1">
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
          ))}
        </div>
      </main>
    </>
  )
}
