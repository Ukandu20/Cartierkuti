import axios from 'axios';

axios.defaults.baseURL =
    process.env.NODE_ENV === 'development' ? 'https://cartierkuti.onrender.com' : '/';
