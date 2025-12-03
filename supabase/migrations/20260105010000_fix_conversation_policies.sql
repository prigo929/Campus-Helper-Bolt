/*
  # Fix conversation participant policy recursion

  - Add helper to check membership without recursive RLS
  - Update participant and message policies to use the helper
*/

CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = _conversation_id AND cp.user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_conversation_member(uuid) TO authenticated;

DROP POLICY IF EXISTS "View participants in your conversations" ON conversation_participants;
CREATE POLICY "View participants in your conversations"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (public.is_conversation_member(conversation_id));

DROP POLICY IF EXISTS "Add participants if starter or self" ON conversation_participants;
CREATE POLICY "Add participants if starter or self"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id AND c.started_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "View messages as participant" ON messages;
CREATE POLICY "View messages as participant"
  ON messages FOR SELECT
  TO authenticated
  USING (public.is_conversation_member(conversation_id));

DROP POLICY IF EXISTS "Send messages as participant" ON messages;
CREATE POLICY "Send messages as participant"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_conversation_member(conversation_id)
  );
