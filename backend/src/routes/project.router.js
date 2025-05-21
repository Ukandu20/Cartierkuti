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
projectRouter.post("/", asyncHandler(async (req, res) => {
  const project = await Project.create(req.body);
  res.json(project);
}));


/* ─────────────── UPDATE */
projectRouter.put(  '/:id',  asyncHandler(async (req, res) => {
    const project = await Project.findByIdAndUpdate( req.params.id, req.body, 
      { new: true }
    );
    if (!project) { return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  }));

/* ─────────────── DELETE */
projectRouter.delete( '/:id', asyncHandler(async (req, res) => {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(204).send(); 
  })
);


/* ─────────────── GET all reviews */
projectRouter.get(
  '/:id/reviews',
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id).select('ratings');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project.ratings);
  })
);

/* ─────────────── POST new review & recalc avg */
projectRouter.post(
  '/:id/reviews',
  asyncHandler(async (req, res) => {
    const { stars, comment } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.ratings.push({ stars, comment, date: new Date() });
    project.avgStars =
      project.ratings.reduce((sum, r) => sum + r.stars, 0) /
      project.ratings.length;
    await project.save();

    res.json({ avgStars: project.avgStars, total: project.ratings.length });
  })
);


export default projectRouter;
