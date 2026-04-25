import mongoose from 'mongoose'
import { z } from 'zod'

const text = (max) => z.string().trim().min(1).max(max)
const optionalText = (max) => z.string().trim().max(max).optional()
const url = z.string().trim().url().max(2048)
const optionalUrl = z.union([z.literal(''), url]).optional()

export const objectIdSchema = z.object({
  id: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: 'Invalid Mongo ObjectId',
  }),
})

export const authLoginSchema = z
  .object({
    username: text(120),
    password: z.string().min(1).max(256),
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

export const activityWriteSchema = z
  .object({
    projectId: z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
      message: 'Invalid projectId',
    }),
    type: z.enum(['Created', 'Updated', 'Deleted']),
    title: text(160),
    detail: z.string().trim().max(1000).optional(),
    userId: z
      .string()
      .refine((value) => mongoose.Types.ObjectId.isValid(value), {
        message: 'Invalid userId',
      })
      .optional(),
  })
  .strict()
