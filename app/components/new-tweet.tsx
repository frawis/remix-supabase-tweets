import { RocketIcon } from '@radix-ui/react-icons'
import { Form } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'

interface NewTweetProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Database['public']['Tables']['profiles']['Row'] | null
}

const NewTweet = ({ user }: NewTweetProps) => {
  return (
    <div className="flex">
      <div className="w-12 flex-shrink-0 px-2">
        <img
          className="h-8 w-8 rounded-full"
          src={user?.avatar_url}
          alt={user?.name}
        />
      </div>
      <div className="flex-1 pr-4">
        <Form method="post" action="/api/tweet/new" className="grid gap-4">
          <Textarea name="content" placeholder="What's happening?" required />
          <div className="flex justify-end">
            <Button type="submit">
              <RocketIcon className="mr-1 h-[15px] w-[15px]" />
              <span>Tweet</span>
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export { NewTweet }
