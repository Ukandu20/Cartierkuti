import apiClient from '@/utils/axiosConfig'
import { normalizeProject, normalizeProjects } from '@/utils/projectNormalizer'

export const getAll = async () => {
    const { data } = await apiClient.get('/api/projects/');
    return normalizeProjects(data);
};

export const getById = async projectId => {
    const { data } = await apiClient.get('/api/projects/' + projectId);
    return normalizeProject(data);
};
