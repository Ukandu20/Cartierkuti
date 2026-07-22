import cloudinary from '../config/cloudinary.js'
import logger from '../logger.js'

export async function destroyProjectImage(assetId) {
  if (!assetId) return false
  try {
    await cloudinary.uploader.destroy(assetId, { resource_type: 'image', invalidate: true })
    return true
  } catch (error) {
    logger.error({ error, assetId }, 'Could not remove project image from Cloudinary')
    return false
  }
}
