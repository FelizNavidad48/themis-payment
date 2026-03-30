import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!cachedClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
    cachedClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return cachedClient;
}

export const supabase = {
  from: (...args: Parameters<ReturnType<typeof getSupabaseClient>['from']>) => getSupabaseClient().from(...args),
  auth: new Proxy({} as ReturnType<typeof getSupabaseClient>['auth'], {
    get: (_, prop) => getSupabaseClient().auth[prop as keyof ReturnType<typeof getSupabaseClient>['auth']],
  }),
};
