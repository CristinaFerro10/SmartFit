import api from './api-service';

const apiUrl = '/pt';

const activePackageGet = async (id: number) => {
    try {
        const response = await api.get(
            `${apiUrl}/package/active/${id}`
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const historyPackage = async (id: number) => {
    try {
        const response = await api.get(
            `${apiUrl}/package/history/${id}`
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export { activePackageGet, historyPackage };