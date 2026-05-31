import { createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types';

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  profile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);
