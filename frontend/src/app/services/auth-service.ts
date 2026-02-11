import api from './api-service';

const login = async (username: string, password: string) => {
    try {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await api.post(
            '/auth/token',
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // Salva il token
        localStorage.setItem('token', response.data.access_token);

        return response.data;
    } catch (error) {
        throw error;
    }
};

export { login };