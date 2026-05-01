// routes/activities.router.js
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import rateLimit from 'express-rate-limit';
import Activity from '../models/activity.model.js';
import Project from '../models/project.model.js';
import ArchivedProject from '../models/archive.model.js';
import requireAdmin from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { activityWriteSchema } from '../validation/schemas.js';

const activitiesRouter = Router();

// (Optional) limit how often clients can write activities
const writeLimiter = rateLimit({ windowMs: 60_000, max: 20 });

const getProductionProjectActivityFilter = async (projectId) => {
  if (process.env.NODE_ENV !== 'production') return {};

  if (projectId) {
    const [activeProject, archivedProject] = await Promise.all([
      Project.exists({ _id: projectId }),
      ArchivedProject.exists({ originalId: projectId }),
    ]);

    return activeProject || archivedProject
      ? { projectId }
      : { projectId: { $in: [] } };
  }

  const [activeProjectIds, archivedProjectIds] = await Promise.all([
    Project.distinct('_id'),
    ArchivedProject.distinct('originalId'),
  ]);

  return {
    projectId: {
      $in: [...activeProjectIds, ...archivedProjectIds],
    },
  };
};

/* ──────────── CREATE ACTIVITY ──────────────────────────── */
activitiesRouter.post(
  '/',
  writeLimiter,
  requireAdmin,
  validate({ body: activityWriteSchema }),
  asyncHandler(async (req, res) => {
    const { projectId, type, title, detail, userId } = req.body;
    const activity = await Activity.create({ projectId, type, title, detail, userId });
    res.status(201).json(activity);
  })
);

/* ──────────── READ ACTIVITIES w/ type + date-range filters ──────────────────────────── */
activitiesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      projectId,
      type,
      startDate,    // YYYY-MM-DD or full ISO string
      endDate,      // YYYY-MM-DD or full ISO string
      page = 1,
      limit = 50,
    } = req.query;

    const filter = await getProductionProjectActivityFilter(projectId);
    if (projectId && process.env.NODE_ENV !== 'production') filter.projectId = projectId;
    if (type)      filter.type      = type;

    // add date-range filter on `timestamp`
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate)   filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (Math.max(Number(page), 1) - 1) * Number(limit);
    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Activity.countDocuments(filter),
    ]);

    res.json({
      activities,
      total,
      page:  Number(page),
      limit: Number(limit),
    });
  })
);

export default activitiesRouter;
