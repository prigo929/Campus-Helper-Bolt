/*
  # Allow starters to read their new conversations

  - Update conversation SELECT policy so the starter can read the row even before participants are inserted
*/

DROP POLICY IF EXISTS "View conversations as participant" ON conversations;

CREATE POLICY "View conversations as participant or starter"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    public.is_conversation_member(id)
    OR started_by = auth.uid()
  );
