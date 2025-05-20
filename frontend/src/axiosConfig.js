import axios from 'axios';

// Use VITE_API_URL from .env
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const getData = async () => {
  try {
    const response = await axios.get('/api/projects');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

getData();
