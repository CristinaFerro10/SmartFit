import { CustomerDashboardFilter } from '../lib/filtermodel';
import api from './api-service';

const apiUrl = '/customer';

const getCustomersIST = async (params: CustomerDashboardFilter) => {
    try {
        const response = await api.get(
            `${apiUrl}/dashboard`,
            {
                params: params
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const getCustomersDetailIST = async (id: number) => {
    try {
        const response = await api.get(
            `${apiUrl}/detail`,
            {
                params: {
                    customer: id
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const updateDescription = async (id: number, description: string) => {
    try {
        const response = await api.put(
            `${apiUrl}/description`,
            {
                CustomerId: id,
                Description: description
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export { getCustomersIST, getCustomersDetailIST, updateDescription };