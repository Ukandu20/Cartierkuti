import { Router } from "express";
import { project_data } from "../assets/data/data.js";

const projectRouter = Router();

// Get all projects
projectRouter.get("/", (req, res) => {
    res.json(project_data);
});

// Get a specific project by its ID
projectRouter.get("/:id", (req, res) => {
    const projectId = req.params.id;
    if (!projectId) {
        return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = project_data.find((project) => project.id === projectId);
    if (project) {
        res.json(project);
    } else {
        res.status(404).json({ message: "Project not found" });
    }
});

export default projectRouter;