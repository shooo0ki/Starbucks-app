import type { Session, User } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};
