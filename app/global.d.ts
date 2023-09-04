import type { Database as DB } from '~/types/supabase.types';

declare global {
  type Database = DB;
}
