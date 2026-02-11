import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthData } from '../lib/auth';
import { login } from '../services/auth-service';
import { useAuthStore } from '../stores/authStore';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const { loginStore, getDefaultRoute } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await login(email, password);

            if (response?.access_token) {
                loginStore(response.access_token);
                const route = getDefaultRoute();
                navigate(route);
            }
            else {
                setError(response?.message || 'Login fallito');
            }
        } catch (err) {
            setError('Errore durante il login. Controlla le credenziali e riprova.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Login</h2>
                {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition">
                        Accedi
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;