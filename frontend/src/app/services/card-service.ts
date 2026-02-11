import { CardRequest } from '../lib/set-types';
import api from './api-service';

const apiUrl = '/card';

const newCard = async (params: CardRequest) => {
    try {
        const response = await api.post(
            `${apiUrl}/`,
            params
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const rescheduleCard = async (id: number) => {
    try {
        const response = await api.put(
            `${apiUrl}/reschedule/${id}`,
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export { rescheduleCard, newCard };