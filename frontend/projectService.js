import apiClient from '@/utils/axiosConfig'

export const getAll = async () => {
    const { data } = await apiClient.get('/api/projects/');
    return data;
};

export const getById = async projectId => {
    const { data } = await apiClient.get('/api/projects/' + projectId);
    return data;
};