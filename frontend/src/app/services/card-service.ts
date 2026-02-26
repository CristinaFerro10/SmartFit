import { CardRequest } from '../lib/set-types';
import { CardMonthlyParams } from '../lib/types';
import api from './api-service';

const apiUrl = '/card';

const cardMonthlyCounters = async (params: CardMonthlyParams) => {
    try {
        const queryParams = getCardsQueryParams(params);
        const response = await api.get(
            `${apiUrl}/summary`,
            { params: queryParams }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly counters:', error);
        throw error;
    }
};

const totalCardMonthlyCounters = async (params: CardMonthlyParams) => {
    try {
        const queryParams = getCardsQueryParams(params);
        const response = await api.get(
            `${apiUrl}/summary/total`,
            { params: queryParams }
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

export { rescheduleCard, newCard, undoCard, cardMonthlyCounters, totalCardMonthlyCounters };

function getCardsQueryParams(params: CardMonthlyParams) {
    const queryParams = new URLSearchParams();
    params.months?.forEach(month => queryParams.append('months', month.toString()));
    queryParams.append('year', params.year.toString());
    if (params.isMDSSubscription) {
        queryParams.append('isMDSSubscription', params.isMDSSubscription.toString());
    }
    if (params.includeNew) {
        queryParams.append('includeNew', params.includeNew.toString());
    }
    if (params.includeRenewed) {
        queryParams.append('includeRenewed', params.includeRenewed.toString());
    }
    if (params.includeUpdates) {
        queryParams.append('includeUpdates', params.includeUpdates.toString());
    }
    if (params.includePT) {
        queryParams.append('includePT', params.includePT.toString());
    }
    return queryParams;
}
