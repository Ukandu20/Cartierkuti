
import axios from 'axios';

axios.defaults.baseURL =
    process.env.NODE_ENV === 'development' ? 'https://localhost:5000/' : '/';
