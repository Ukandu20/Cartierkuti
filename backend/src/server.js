import express from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import projectRouter from './routers/project.router.js';
import router from './routers/router.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));

app.use('/api/projects', projectRouter);

app.get('/', router);

const publicFolder = path.join(__dirname, 'public');
app.use(express.static(publicFolder));

app.get('*', (req, res) => {
    const indexFilePath = path.join(__dirname, 'index.html')
    res.sendFile(indexFilePath);
});



const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ` + PORT);
});
