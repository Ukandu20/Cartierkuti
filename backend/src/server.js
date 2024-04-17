import express from 'express';
import cors from 'cors';
import projectRouter from './routers/project.router.js';
import router from './routers/router.js';


const app = express();
app.use(cors({
    origin: ['http://localhost:3002'],
    credentials: true
}));

app.use('/api/projects', projectRouter);

app.get('/', router);


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ` + PORT);
});