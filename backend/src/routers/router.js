import { Router } from "express";

const router = new Router();

router.get("/", (req, res) => {
    res.send({ message: "Welcome to the backend! Type '/api/docs' for documentation, '/api/projects' for projects" });
});

router.get("/api/docs", (req, res) => {
    res.send({ message: "API Documentation" });
});

router.get("/api/projects", (req, res) => {
    res.send({ message: "Projects" });
});

export default router;
