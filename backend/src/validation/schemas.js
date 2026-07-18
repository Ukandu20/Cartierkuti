import mongoose from 'mongoose'
import { z } from 'zod'

const text = (max) => z.string().trim().min(1).max(max)
const optionalText = (max) => z.string().trim().max(max).optional()
const url = z.string().trim().url().max(2048)
const optionalUrl = z.union([z.literal(''), url]).optional()
const objectId = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid Mongo ObjectId',
})
const dateInput = z.string().trim().max(40).refine(
  (value) => !Number.isNaN(Date.parse(value)),
  { message: 'Invalid date' },
)

export const objectIdSchema = z.object({
  id: objectId,
})

export const archiveQuerySchema = z
  .object({
    projectId: objectId.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict()

export const activityQuerySchema = z
  .object({
    projectId: objectId.optional(),
    type: z.enum(['Created', 'Updated', 'Deleted']).optional(),
    startDate: dateInput.optional(),
    endDate: dateInput.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict()
  .refine(
    ({ startDate, endDate }) => !startDate || !endDate || new Date(startDate) <= new Date(endDate),
    { message: 'startDate must not be after endDate', path: ['startDate'] },
  )

export const authLoginSchema = z
  .object({
    username: text(120),
    password: z.string().min(1).max(256),
  })
  .strict()

const accountEmail = z.string().trim().email().max(254)
const adminUsername = z.string().trim().min(3).max(64).regex(
  /^[A-Za-z0-9._-]+$/,
  'Use only letters, numbers, periods, underscores, and hyphens'
)
const newPassword = z.string().min(12).max(128)

export const passwordRecoveryRequestSchema = z.object({ email: accountEmail }).strict()

export const usernameRecoveryRequestSchema = z.object({ email: accountEmail }).strict()

export const passwordResetSchema = z
  .object({
    token: z.string().min(32).max(256),
    password: newPassword,
    confirmPassword: z.string().min(1).max(128),
  })
  .strict()
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export const credentialChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(256),
    newUsername: adminUsername.optional(),
    newPassword: newPassword.optional(),
    confirmPassword: z.string().max(128).optional(),
    mfaCode: z.string().trim().min(6).max(32).optional(),
  })
  .strict()
  .refine(({ newUsername, newPassword }) => Boolean(newUsername || newPassword), {
    message: 'Provide a new username or password',
  })
  .refine(({ newPassword, confirmPassword }) => !newPassword || newPassword === confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export const mfaSetupSchema = z.object({ currentPassword: z.string().min(1).max(256) }).strict()

export const mfaCodeSchema = z.object({ code: z.string().trim().min(6).max(32) }).strict()

export const mfaLoginSchema = z
  .object({
    challengeToken: z.string().min(32).max(4096),
    code: z.string().trim().min(6).max(32),
  })
  .strict()

export const mfaDisableSchema = z
  .object({
    currentPassword: z.string().min(1).max(256),
    code: z.string().trim().min(6).max(32),
  })
  .strict()

export const projectWriteSchema = z
  .object({
    category: text(80),
    title: text(160),
    description: text(4000),
    languages: z.array(text(60)).min(1).max(30),
    status: text(80),
    tags: z.array(text(60)).min(1).max(40),
    metadata: optionalText(4000),
    externalLink: url,
    githubLink: url,
    liveDemoLink: optionalUrl,
    imageUrl: optionalUrl,
    featured: z.boolean().optional(),
  })
  .strict()

export const projectUpdateSchema = projectWriteSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one project field is required' }
)

export const reviewWriteSchema = z
  .object({
    stars: z.coerce.number().int().min(1).max(5),
    comment: text(1000),
  })
  .strict()

export const reviewQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict()

const stringArray = z.array(text(160)).max(50).default([])

export const resumeWriteSchema = z
  .object({
    headline: optionalText(200),
    summary: optionalText(4000),
    highlights: stringArray,
    metrics: z
      .array(
        z
          .object({
            label: optionalText(80),
            value: optionalText(80),
            note: optionalText(160),
          })
          .strict()
      )
      .max(20)
      .default([]),
    experience: z
      .array(
        z
          .object({
            role: optionalText(160),
            company: optionalText(160),
            location: optionalText(160),
            period: optionalText(120),
            bullets: stringArray,
          })
          .strict()
      )
      .max(30)
      .default([]),
    education: z
      .array(
        z
          .object({
            school: optionalText(160),
            degree: optionalText(160),
            period: optionalText(120),
            bullets: stringArray,
          })
          .strict()
      )
      .max(20)
      .default([]),
    certifications: z
      .array(
        z
          .object({
            name: optionalText(160),
            issuer: optionalText(160),
            year: optionalText(40),
          })
          .strict()
      )
      .max(30)
      .default([]),
    skills: z
      .object({
        primary: stringArray,
        secondary: stringArray,
        tools: stringArray,
      })
      .strict()
      .default({ primary: [], secondary: [], tools: [] }),
  })
  .strict()
