import axios from 'axios';

export const getAll = async () => {
    const { data } = await axios.get('/api/projects/');
    return data;
};

export const getById = async projectId => {
    const { data } = await axios.get('/api/projects/' + projectId);
    return data;
};