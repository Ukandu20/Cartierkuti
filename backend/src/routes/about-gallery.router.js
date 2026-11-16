import { Router } from 'express'
import multer from 'multer'
import asyncHandler from 'express-async-handler'
import crypto from 'crypto'
import requireAdmin from '../middleware/auth.js'
import Resume from '../models/resume.model.js'
import cloudinary from '../config/cloudinary.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1 } })
const supportedImage = (buffer) => {
  const hex = buffer.subarray(0, 12).toString('hex')
  return hex.startsWith('ffd8ff') || hex.startsWith('89504e470d0a1a0a')
    || hex.startsWith('474946383761') || hex.startsWith('474946383961')
    || (hex.startsWith('52494646') && buffer.subarray(8, 12).toString('ascii') === 'WEBP')
}

router.post('/', requireAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file || !req.file.mimetype.startsWith('image/') || !supportedImage(req.file.buffer)) {
    return res.status(400).json({ message: 'Choose a PNG, JPEG, WebP, or GIF image, maximum 2 MB.' })
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({ message: 'Image storage is not configured' })
  }
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      public_id: `cartierkuti/about-gallery/${crypto.randomUUID()}`, resource_type: 'image', overwrite: false,
    }, (error, uploaded) => error ? reject(error) : resolve(uploaded))
    stream.end(req.file.buffer)
  })
  res.json({ imageUrl: result.secure_url, imageAssetId: result.public_id })
}))

router.delete('/', requireAdmin, asyncHandler(async (req, res) => {
  const assetId = req.body?.imageAssetId
  if (typeof assetId !== 'string' || !/^cartierkuti\/about-gallery\/[a-f0-9-]{36}$/.test(assetId)) {
    return res.status(400).json({ message: 'Invalid gallery image asset' })
  }
  if (await Resume.exists({ 'gallery.imageAssetId': assetId })) {
    return res.status(409).json({ message: 'This image is in the saved About page' })
  }
  await cloudinary.uploader.destroy(assetId, { resource_type: 'image', invalidate: true })
  res.sendStatus(204)
}))

export default router
