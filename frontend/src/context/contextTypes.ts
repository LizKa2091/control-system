export type AuthUser = {
   id: string;
   email: string;
   role: 'engineer' | 'manager' | 'lead' | 'admin';
};

export type AuthContextValue = {
   token: string | null;
   user: AuthUser | null;
   isAuthenticated: boolean;
   login: (token: string, user?: AuthUser) => void;
   logout: () => void;
   hasRole: (role: AuthUser['role']) => boolean;
   hasAnyRole: (roles: AuthUser['role'][]) => boolean;
};
