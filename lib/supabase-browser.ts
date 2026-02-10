'use client';

import { createBrowserClient } from '@supabase/ssr';
import { assertEnv } from './env';

export function createSupabaseBrowserClient() {
  assertEnv();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
