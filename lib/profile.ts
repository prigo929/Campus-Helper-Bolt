import type { Session, SupabaseClient } from '@supabase/supabase-js';

export type ProfileDefaults = {
  full_name?: string;
  email?: string;
  university?: string;
  major?: string;
  year?: string;
};

export async function ensureProfileExists(
  client: SupabaseClient | null,
  session: Session | null,
  defaults: ProfileDefaults = {}
) {
  if (!client || !session?.user) {
    return;
  }

  const user = session.user;
  const emailAddress = defaults.email ?? user.email ?? '';
  const metadata = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  const resolvedEmail = emailAddress || metadata.email?.trim() || 'unknown@example.com';

  const { data: existing, error } = await client
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .limit(1);

  if (error) {
    throw error;
  }

  if (existing && existing.length > 0) {
    return;
  }

  const fullName =
    defaults.full_name?.trim() ||
    metadata.full_name?.trim() ||
    (resolvedEmail ? resolvedEmail.split('@')[0] : 'Military Helper user');
  const university = defaults.university?.trim() || metadata.university?.trim() || 'Unknown university';
  const major = defaults.major ?? metadata.major ?? '';
  const year = defaults.year ?? metadata.year ?? '';

  const { error: insertError } = await client.from('profiles').insert({
    id: user.id,
    email: resolvedEmail,
    full_name: fullName,
    university,
    major,
    year,
  });

  if (insertError) {
    throw insertError;
  }
}
