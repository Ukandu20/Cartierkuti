// routes/activities.router.js
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import Activity from '../models/activity.model.js';
import requireAdmin from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { activityQuerySchema } from '../validation/schemas.js';

const activitiesRouter = Router();

/* ──────────── READ ACTIVITIES w/ type + date-range filters ──────────────────────────── */
activitiesRouter.get(
  '/',
  requireAdmin,
  validate({ query: activityQuerySchema }),
  asyncHandler(async (req, res) => {
    const {
      projectId,
      type,
      startDate,    // YYYY-MM-DD or full ISO string
      endDate,      // YYYY-MM-DD or full ISO string
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (type)      filter.type      = type;

    // add date-range filter on `timestamp`
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) end.setUTCHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    const skip = (page - 1) * limit;
    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments(filter),
    ]);

    res.json({
      activities,
      total,
      page,
      limit,
    });
  })
);

export default activitiesRouter;
