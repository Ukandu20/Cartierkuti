import express from 'express';
import cors from 'cors';
import projectRouter from './routers/project.router.js';


const app = express();
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));

app.use('/api/projects', projectRouter);

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ` + PORT);
});