import { ZodError } from 'zod'

export const validate =
  ({ body, params, query } = {}) =>
  (req, _res, next) => {
    try {
      if (body) req.body = body.parse(req.body)
      if (params) req.params = params.parse(req.params)
      if (query) req.query = query.parse(req.query)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = new Error('Validation failed')
        validationError.status = 400
        validationError.details = err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }))
        return next(validationError)
      }
      next(err)
    }
  }
