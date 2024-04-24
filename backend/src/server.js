import express from 'express';
import cors from 'cors';
import path from 'path';
import projectRouter from './routers/project.router.js';
import router from './routers/router.js';

// Determine the directory name of the current module using URL and path modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

// Configure CORS middleware to allow requests from 'http://localhost:3000' with credentials
app.use(cors({
    origin: ['http://localhost:3000', 'http://cartierkuti.netlify.app'],
    credentials: true
}));

// Routes for project data
app.use('/api/projects', projectRouter);
// Root route handler
app.get('/', router);

// Set the directory for serving static files
const publicFolder = path.join(__dirname, 'public');
app.use(express.static(publicFolder));

// Fallback route for handling all other requests
app.get('*', (req, res) => {
    const indexFilePath = path.join(publicFolder, 'index.html');
    console.log(`Attempting to send file from: ${indexFilePath}`);  // Debugging output for the file path

    // Send index.html with error handling
    res.sendFile(indexFilePath, err => {
        if (err) {
            console.error('Error sending file:', err);  // Log the error
            res.status(500).send("Error: Unable to serve the requested file.");  // Send error response
        }
    });
});

// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
