import { CompleteSessionPackage, DeleteLastSessionPackage, NewPackageRequest, UpgradePackageRequest } from '../lib/set-types';
import api from './api-service';

const apiUrl = '/pt';

const sessionPackageTypeGet = async () => {
    try {
        const response = await api.get(
            `${apiUrl}/session/type`
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

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

const newPackage = async (params: NewPackageRequest) => {
    try {
        const response = await api.post(
            `${apiUrl}/package`,
            params
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const completeSession = async (params: CompleteSessionPackage) => {
    try {
        const response = await api.post(
            `${apiUrl}/session`,
            params
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const upgradePackage = async (params: UpgradePackageRequest) => {
    try {
        const response = await api.put(
            `${apiUrl}/package/upgrade`,
            params
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const deleteLastSession = async (params: DeleteLastSessionPackage) => {
    try {
        const response = await api.delete(
            `${apiUrl}/session`,
            { data: params }
        );
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export { sessionPackageTypeGet, activePackageGet, historyPackage, newPackage, completeSession, upgradePackage, deleteLastSession };