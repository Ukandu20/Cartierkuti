import path from 'path'
import dotenv from 'dotenv'
import { cleanEnv, port, str } from 'envalid'

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development'

dotenv.config({ path: path.resolve(process.cwd(), envFile) })

export function validateEnvironment() {
  const common = {
    NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
    PORT: port({ default: 5000 }),
    MONGODB_URI: str(),
  }

  if (process.env.NODE_ENV === 'production') {
    return cleanEnv(process.env, {
      ...common,
      CLIENT_URL: str(),
      ADMIN_USERNAME: str(),
      ADMIN_PASSWORD_HASH: str(),
      JWT_SECRET: str(),
      CLOUDINARY_CLOUD_NAME: str(),
      CLOUDINARY_API_KEY: str(),
      CLOUDINARY_API_SECRET: str(),
    })
  }

  return cleanEnv(process.env, common)
}
