import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface AuthContextData {
    user: User | null;
    loadingAuth: boolean;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextData>({
    user: null,
    loadingAuth: true,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        // Listener automático do Firebase — atualiza sempre que o estado mudar
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoadingAuth(false);
        });

        return () => unsubscribe(); // limpa ao desmontar
    }, []);

    return (
        <AuthContext.Provider value={{ user, loadingAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextData {
    return useContext(AuthContext);
}
