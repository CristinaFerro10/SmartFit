import { CardRequest } from '../lib/set-types';
import api from './api-service';

const apiUrl = '/card';

const cardMonthlyCounters = async (months: number[] | null, year: number) => {
    try {
        const params = new URLSearchParams();
        months?.forEach(month => params.append('months', month.toString()));
        params.append('year', year.toString());

        const response = await api.get(
            `${apiUrl}/summary`,
            { params }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly counters:', error);
        throw error;
    }
};


const newCard = async (params: CardRequest) => {
    try {
        const response = await api.post(
            `${apiUrl}/`,
            params
        );
        return response.data;
    } catch (error) {
        console.error('Error creating new card:', error);
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
        console.error('Error rescheduling card:', error);
        throw error;
    }
};

const undoCard = async (id: number) => {
    try {
        const response = await api.put(
            `${apiUrl}/undo/${id}`,
        );
        return response.data;
    } catch (error) {
        console.error('Error undoing card:', error);
        throw error;
    }
};

export { rescheduleCard, newCard, undoCard, cardMonthlyCounters };