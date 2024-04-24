import express from 'express';
import cors from 'cors';
import path from 'path'; // Import path without destructuring

import projectRouter from './routers/project.router.js';
import router from './routers/router.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname); // Use new URL instead of fileURLToPath

const app = express();
app.use(cors({
    origin: ['https://cartierkuti.netlify.app', 'https://localhost:3000'],
    credentials: true
}));

app.use('/api/projects', projectRouter);

app.get('/', router);

const publicFolder = path.join(__dirname, 'public');
app.use(express.static(publicFolder));

app.get('*', (req, res) => {
    const indexFilePath = path.join(publicFolder, 'index.html'); // Serve index.html from the public folder
    res.sendFile(indexFilePath);
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
