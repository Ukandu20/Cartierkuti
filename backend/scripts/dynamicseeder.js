// scripts/dynamicseeder.js
import path from 'path'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import Project from '../src/models/project.model.js'
import Activity from '../src/models/activity.model.js'

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development'
dotenv.config({ path: path.resolve(process.cwd(), envFile) })

if (process.env.NODE_ENV === 'production') {
  console.warn('Dynamic seeder disabled in production')
  process.exit(0)
}

function makeReviews() {
  return Array.from({ length: faker.number.int({ min: 4, max: 10 }) })
    .map(() => ({
      stars: faker.number.int({ min: 1, max: 5 }),
      comment: faker.lorem.sentence(),
      date: faker.date.recent(90),
    }))
}

function generateFakeProjects(count = 50) {
  return Array.from({ length: count }).map(() => {
    const createdDate = faker.date.past({ years: 1 })
    const lastUpdatedDate = faker.date.between({ from: createdDate, to: new Date() })

    return {
      category: faker.helpers.arrayElement([
        'Sports Analytics',
        'Machine Learning & Forecasting',
        'Data Analytics & BI',
        'Data Systems & Pipelines',
        'Web Applications',
      ]),
      title: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      tools: faker.helpers.arrayElements(
        ['React', 'Node.js', 'Express', 'MongoDB', 'Python', 'Java', 'Flutter', 'Next.js', 'TypeScript'],
        faker.number.int({ min: 2, max: 4 })
      ),
      methods: faker.helpers.arrayElements(
        ['Exploratory Data Analysis', 'Feature Engineering', 'Model Evaluation', 'Dashboard Design', 'REST API Design'],
        faker.number.int({ min: 1, max: 3 })
      ),
      status: faker.helpers.arrayElement(['In Progress', 'Completed']),
      tags: faker.helpers.arrayElements(
        ['Football', 'Sales', 'Decision Support', 'Operations', 'Portfolio'],
        faker.number.int({ min: 1, max: 3 })
      ),
      metadata: faker.internet.url(),
      externalLink: faker.internet.url(),
      githubLink: faker.internet.url(),
      liveDemoLink: faker.internet.url(),
      imageUrl: faker.image.urlLoremFlickr({ category: 'technology' }),
      featured: faker.datatype.boolean(),
      views: faker.number.int({ min: 25, max: 500 }),
      reviews: makeReviews(),
      createdDate,
      lastUpdatedDate,
    }
  })
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  })

  if (process.argv.includes('--wipe')) {
    console.log('Clearing existing development projects and activities...')
    await Project.deleteMany()
    await Activity.deleteMany()
  }

  const docs = generateFakeProjects(50)
  let createdCount = 0
  let activityCount = 0

  for (const data of docs) {
    // Create project and trigger the post-save "Created" activity.
    const proj = await Project.create(data)
    createdCount++

    // Add 1-3 "Updated" logs after creation.
    const updCount = faker.number.int({ min: 1, max: 3 })
    for (let i = 0; i < updCount; i++) {
      await Activity.create({
        projectId: proj._id,
        type: 'Updated',
        title: proj.title,
        detail: 'Auto-seeded update',
        timestamp: faker.date.between({ from: proj.createdDate, to: proj.lastUpdatedDate }),
      })
      activityCount++
    }
  }

  console.log(`Seeded ${createdCount} projects and ${createdCount + activityCount} activities.`)
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('Seeding error', err)
  process.exit(1)
})
