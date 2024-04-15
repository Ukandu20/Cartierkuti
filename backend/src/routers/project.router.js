import { Router } from "express";
import { project_data } from "../assets/data/data.js";

const projectRouter = Router();

projectRouter.get("/", (req, res) => {
    res.json(project_data);
});

// Get a specific project by its ID
projectRouter.get("/:id", (req, res) => {
    const project = project_data.find((project) => project.id === req.params.id);
    if (project) {
        res.json(project);
    } else {
        res.status(404).json({ message: "Project not found" });
    }
});




export default projectRouter;