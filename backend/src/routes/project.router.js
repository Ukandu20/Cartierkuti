import { Router } from "express";
import Project from "../models/project.model.js"; 
import asyncHandler from 'express-async-handler';
import rateLimit   from 'express-rate-limit';

const hitLimiter = rateLimit({ windowMs: 60_000, max: 5 });
const projectRouter = Router();

/* READ all */
projectRouter.get('/', asyncHandler(async (_req, res) => {
  const projects = await Project.find();
  res.json(projects);
}));

/* READ one */
projectRouter.get('/:id', asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Not found' });
  res.json(project);
}));

/* increment views – protected */
projectRouter.patch('/:id/hit', hitLimiter, asyncHandler(async (req, res) => {
  const { views } = await Project.findByIdAndUpdate(
    req.params.id, { $inc: { views: 1 } }, { new: true, select: 'views' }
  );
  res.json({ views });
}));

/* ─────────────── CREATE */
projectRouter.post("/", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.json(project);
  } catch {
    res.status(500).json({ message: "Error creating project" });
  }
});

/* ─────────────── UPDATE */
projectRouter.put("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).exec();
    project
      ? res.json(project)
      : res.status(404).json({ message: "Project not found" });
  } catch {
    res.status(500).json({ message: "Error updating project" });
  }
});

/* ─────────────── DELETE */
projectRouter.delete("/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id).exec();
    res.json({ message: "Project deleted successfully" });
  } catch {
    res.status(500).json({ message: "Error deleting project" });
  }
});

/* ─────────────── increment view count (for most-viewed sort) */
projectRouter.patch("/:id/hit", async (req, res) => {
  try {
    const proj = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).select("views");
    res.json({ views: proj.views });
  } catch {
    res.status(500).json({ message: "View increment failed" });
  }
});

/* ─────────────── reviews endpoints */

/* GET all reviews */
projectRouter.get("/:id/reviews", async (req, res) => {
  try {
    const { ratings } = await Project.findById(req.params.id).select("ratings");
    res.json(ratings);
  } catch {
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

/* POST new review & recalc avg */
projectRouter.post("/:id/reviews", async (req, res) => {
  try {
    const { stars, comment } = req.body;
    await Project.findByIdAndUpdate(req.params.id, {
      $push: { ratings: { stars, comment, date: new Date() } },
    });

    // recompute average stars
    const proj = await Project.findById(req.params.id).lean();
    const avg =
      proj.ratings.reduce((s, r) => s + r.stars, 0) / proj.ratings.length;

    await Project.findByIdAndUpdate(req.params.id, { avgStars: avg });
    res.json({ avgStars: avg, total: proj.ratings.length });
  } catch {
    res.status(500).json({ message: "Error posting review" });
  }
});

export default projectRouter;
