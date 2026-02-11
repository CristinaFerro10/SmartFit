// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isTokenValid, getUser } = useAuthStore();
    const user = getUser();

    // ✅ Verifica autenticazione
    if (!isAuthenticated || !isTokenValid()) {
        return <Navigate to="/" replace />;
    }

    // ✅ Verifica ruolo
    if (allowedRoles && user && !allowedRoles.includes(user.role.find(r => allowedRoles.includes(r) as any) as any)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;