/*
  # Increment forum post views helper

  Adds a SECURITY DEFINER function to increment forum post views safely,
  and grants execute to anon/authenticated so clients can call it.
*/

CREATE OR REPLACE FUNCTION public.increment_forum_post_views(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE forum_posts
  SET views = COALESCE(views, 0) + 1
  WHERE id = post_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_forum_post_views(uuid) TO anon, authenticated;
