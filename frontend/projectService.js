import axios from 'axios';

export const getAll = async () => {
    const { data } = await axios.get('http://localhost:5000/api/projects/');
    return data;
};

export const getById = async projectId => {
    const { data } = await axios.get('http://localhost:5000/api/projects/' + projectId);
    return data;
};


