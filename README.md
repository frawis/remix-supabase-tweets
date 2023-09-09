# Welcome to Remix Supabase Tweets!

This is a simple demo app that shows how to use [Remix](https://remix.run) with [Supabase](https://supabase.com) to create a Twitter clone.

- [Remix Docs](https://remix.run/docs)
- [Supabase Docs](https://supabase.com/docs)
- [UI (Shadcn)](https://ui.shadcn.com/)

## Development

To run your Remix app locally, make sure your project's local dependencies are installed:

```sh
pnpm install
```

Afterwards, start the Remix development server like so:

```sh
pnpm run dev
```

Open up [http://localhost:3000](http://localhost:3000) and you should be ready to go!

## Supabase

### Setup

Add a new function to your Supabase project called `insert_profile_for_new_user` with the following SQL as return type `trigger` and under advanced settings set `SECURITY DEFINER`:

```sql
begin
  insert into public.profiles(id, name, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
```

Next setup a new trigger on the `auth.users` table with the following settings:

- Trigger name: `on_auth.users_insert`
- Events: `Insert`
- Type: `After the event`
- Orientation: `Row`
- Function: `insert_profile_for_new_user`
