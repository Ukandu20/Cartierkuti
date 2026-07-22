import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import requireAdmin from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { categoryCreateSchema, categoryUpdateSchema, objectIdSchema } from '../validation/schemas.js'
import { archiveCategory, createCategory, listCategories, updateCategory } from '../services/category.service.js'

const categoryRouter = Router()

categoryRouter.get('/', asyncHandler(async (_req, res) => {
  res.json(await listCategories())
}))

categoryRouter.post('/', requireAdmin, validate({ body: categoryCreateSchema }), asyncHandler(async (req, res) => {
  res.status(201).json(await createCategory(req.body))
}))

categoryRouter.put('/:id', requireAdmin, validate({ params: objectIdSchema, body: categoryUpdateSchema }), asyncHandler(async (req, res) => {
  res.json(await updateCategory(req.params.id, req.body))
}))

categoryRouter.delete('/:id', requireAdmin, validate({ params: objectIdSchema }), asyncHandler(async (req, res) => {
  await archiveCategory(req.params.id)
  res.status(204).send()
}))

export default categoryRouter
