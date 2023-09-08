import { Form } from '@remix-run/react'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface NewTweetProps extends React.HTMLAttributes<HTMLDivElement> {
  user: any
}

const NewTweet = ({ user }: NewTweetProps) => {
  return (
    <div className="flex">
      <div className="w-12 flex-shrink-0 px-2">
        <img
          className="h-8 w-8 rounded-full"
          src={user?.user_metadata?.avatar_url}
          alt={user.name}
        />
      </div>
      <div className="flex-1 pr-4">
        <Form method="post" action="/api/tweet/new" className="grid gap-4">
          <Input name="content" placeholder="What's your news?" />
          <div>
            <Button type="submit">Tweet</Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export { NewTweet }
