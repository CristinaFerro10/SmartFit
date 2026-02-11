import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';


const Navbar: React.FC = () => {
    const { isAuthenticated, getUser, logout, isTokenValid } = useAuthStore();
    const navigate = useNavigate();
    const user = getUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (isAuthenticated && !isTokenValid()) {
            logout();
            navigate('/login');
        }
    }, [isAuthenticated, isTokenValid, logout, navigate]);

    return (
        <nav className="sticky top-0 w-full z-50">
            {isAuthenticated && user && (
                <div className="flex justify-between items-center p-4 bg-white shadow-md border-b">
                    <div className="flex gap-6 items-center">
                        <div className="flex gap-4">
                            <Link to={user.role.includes('SGR') ? '/dashboard' : '/trainer-dashboard'} className="hover:text-indigo-500 transition">
                                Dashboard
                            </Link>
                            {user.role.includes('ADM') && (
                                <Link to="/annual-summary" className="hover:text-indigo-500 transition">Riepilogo Annuale</Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 italic">Utente: {user.name}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded-md border border-red-200 hover:bg-red-100 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;