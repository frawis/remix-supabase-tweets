import { DialogTitle } from '@radix-ui/react-dialog'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from './ui/textarea'
import * as React from 'react'
import { z } from 'zod'
import { useForm } from '@conform-to/react'
import { parse } from '@conform-to/zod'
import { useFetcher } from '@remix-run/react'
import { cn } from '~/lib/utils'

interface EditProfileProps {
  profile: Database['public']['Tables']['profiles']['Row'] | null
}

const formSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  description: z
    .object({
      content: z.string(),
    })
    .optional(),
  website: z.string().optional(),
})

const EditProfile: React.FC<EditProfileProps> = ({ profile }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const editProfile = useFetcher()
  const [
    form,
    { name, first_name, last_name, website, description, username },
  ] = useForm({
    onValidate({ formData }) {
      return parse(formData, { schema: formSchema })
    },
  })

  React.useEffect(() => {
    if (editProfile.data?.ok) {
      setIsOpen(false)
    }
  }, [editProfile.data])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <editProfile.Form method="PATCH" action={`/api/profile`} {...form}>
          <div className="grid gap-4 py-4">
            <div>
              <Label
                htmlFor={name.name}
                className={cn(name.error ? 'text-destructive' : '')}
              >
                Name
              </Label>
              <div className="mt-1">
                <Input
                  name={name.name}
                  placeholder="Name"
                  defaultValue={profile?.name ?? ''}
                  className={cn(name.error ? 'border-destructive' : '')}
                />
              </div>
              {name.error && (
                <div className="mt-1 text-sm text-destructive">
                  {name.error}
                </div>
              )}
            </div>
            <div className="grid lg:grid-cols-2 lg:gap-4">
              <div>
                <Label htmlFor={first_name.name}>First name</Label>
                <div className="mt-1">
                  <Input
                    name={first_name.name}
                    defaultValue={profile?.first_name ?? ''}
                    placeholder="e.g. John"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={last_name.name}>Last name</Label>
                <div className="mt-1">
                  <Input
                    name={last_name.name}
                    defaultValue={profile?.last_name ?? ''}
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor={username.name}>Username</Label>
              <div className="mt-1">
                <Input
                  name={username.name}
                  defaultValue={profile?.username ?? ''}
                  placeholder="Username"
                  disabled={profile?.username !== null}
                />
              </div>
            </div>
            <div>
              <Label htmlFor={description.name}>Bio</Label>
              <div className="mt-1">
                <Textarea
                  name={description.name}
                  defaultValue={
                    profile?.description
                      ? JSON.stringify(profile?.description, null, 2)
                      : ''
                  }
                  placeholder="Bio"
                />
              </div>
            </div>
            <div>
              <Label htmlFor={website.name}>Website</Label>
              <div className="mt-1">
                <Input
                  name={website.name}
                  defaultValue={profile?.website ?? ''}
                  placeholder="Website"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={editProfile.state === 'submitting'}
            >
              Save
            </Button>
          </DialogFooter>
        </editProfile.Form>
      </DialogContent>
    </Dialog>
  )
}

export { EditProfile }
