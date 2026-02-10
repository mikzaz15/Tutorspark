import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from './supabase-server';

export async function requireUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return { user, supabase };
}
