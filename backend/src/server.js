import express from 'express';
import cors from 'cors';
import path from 'path';
import projectRouter from './routers/project.router.js';
import router from './routers/router.js';

// Determine the directory name of the current module using URL and path modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

// CORS configuration to allow requests from specific origins with credentials
const corsOptions = {
    origin: ['http://localhost:3000', 'https://cartierkuti.netlify.app'], // Allowed origins
    credentials: true, // Allow credentials such as cookies, authorization headers, etc.
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // Allowed custom headers
};

// Apply CORS middleware with the above options
app.use(cors(corsOptions));

// Enable preflight requests for all routes
app.options('*', cors(corsOptions)); // Include before other routes

// Routes for project data
app.use('/api/projects', projectRouter);

// Root route handler
app.get('/', router);

// Set the directory for serving static files
const publicFolder = path.join(__dirname, 'public');
app.use(express.static(publicFolder));

// Fallback route for handling all other requests and serving index.html
app.get('*', (req, res) => {
    const indexFilePath = path.join(publicFolder, 'index.html');
    console.log(`Attempting to send file from: ${indexFilePath}`); // Debugging output for the file path

    res.sendFile(indexFilePath, err => {
        if (err) {
            console.error('Error sending file:', err); // Log the error
            res.status(500).send("Error: Unable to serve the requested file."); // Send error response
        }
    });
});

// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
