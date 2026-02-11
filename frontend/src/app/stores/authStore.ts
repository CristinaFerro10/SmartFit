// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { UserTokenPayload } from '../lib/types';


interface AuthStore {
    token: string | null;
    isAuthenticated: boolean;

    // Getters
    getUser: () => UserTokenPayload | null;
    isTokenValid: () => boolean;
    getDefaultRoute: () => string;

    // Actions
    loginStore: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            token: null,
            isAuthenticated: false,

            // ✅ Decodifica il token
            getUser: () => {
                const { token } = get();
                if (!token) return null;

                try {
                    return jwtDecode<UserTokenPayload>(token);
                } catch {
                    return null;
                }
            },

            // ✅ Verifica se il token è ancora valido
            isTokenValid: () => {
                const user = get().getUser();
                if (!user || !user.exp) return false;

                const now = Date.now() / 1000; // converti in secondi
                return user.exp > now;
            },

            getDefaultRoute: () => {
                const user = get().getUser();
                if (!user) return '/login';

                return user.role.includes('SGR') ? '/dashboard' : '/trainer-dashboard';
            },

            // ✅ Login
            loginStore: (token) => set({
                token,
                isAuthenticated: true
            }),

            // ✅ Logout
            logout: () => set({
                token: null,
                isAuthenticated: false
            })

        }),
        {
            name: 'auth-storage',
        }
    )
);