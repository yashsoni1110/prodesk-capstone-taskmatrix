import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// ── Lazy singleton — the client is created on first access, not at module
//    evaluation time. This keeps the Supabase SDK off the critical-path JS
//    parse budget, reducing TBT on pages that import auth-store.
let _client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    );
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
