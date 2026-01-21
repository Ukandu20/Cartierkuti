// scripts/dynamicseeder.js
import 'dotenv/config'
import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import Project from '../src/models/project.model.js'
import Activity from '../src/models/activity.model.js'

if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  Dynamic seeder disabled in production')
  process.exit(0)
}

function makeReviews() {
  return Array.from({ length: faker.number.int({ min: 4, max: 10 }) })
    .map(() => ({
      stars:   faker.number.int({ min: 1, max: 5 }),
      comment: faker.lorem.sentence(),
      date:    faker.date.recent(90),
    }))
}

function generateFakeProjects(count = 50) {
  return Array.from({ length: count }).map(() => {
    const createdDate     = faker.date.past({ years: 1 })
    const lastUpdatedDate = faker.date.between({ from: createdDate, to: new Date() })

    return {
      category:     faker.helpers.arrayElement([
        'Web Development', 'Data Analysis', 'Machine Learning/AI', 'Data Science', 'Other',
      ]),
      title:        faker.commerce.productName(),
      description:  faker.lorem.paragraph(),
      languages:    faker.helpers.arrayElements(
                       ['React','Node.js','Express','MongoDB','Python','Java','Flutter','Next.js','TypeScript'],
                       faker.number.int({ min: 2, max: 4 })
                     ),
      status:       faker.helpers.arrayElement(['In Progress','Completed']),
      tags:         faker.helpers.arrayElements([
                       'Frontend','Backend','Fullstack','Data Analysis','Design'
                     ], faker.number.int({ min: 1, max: 3 })),
      metadata:     faker.internet.url(),
      externalLink: faker.internet.url(),
      githubLink:   faker.internet.url(),
      liveDemoLink: faker.internet.url(),
      imageUrl:     faker.image.urlLoremFlickr({ category: 'technology' }),
      featured:     faker.datatype.boolean(),
      views:        faker.number.int({ min: 25, max: 500 }),
      reviews:      makeReviews(),
      createdDate,
      lastUpdatedDate,
    }
  })
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  })

  console.log('🧹  Clearing existing projects & activities…')
  await Project.deleteMany()
  await Activity.deleteMany()

  const docs = generateFakeProjects(50)
  let createdCount = 0
  let activityCount = 0

  for (const data of docs) {
    // create project (triggers post-save hook for "Created" activity)
    const proj = await Project.create(data)
    createdCount++

    // Option A: add 1-3 "Updated" logs after creation
    const updCount = faker.number.int({ min: 1, max: 3 })
    for (let i = 0; i < updCount; i++) {
      await Activity.create({
        projectId: proj._id,
        type:      'Updated',
        title:     proj.title,
        detail:    'Auto-seeded update',
        timestamp: faker.date.between({ from: proj.createdDate, to: proj.lastUpdatedDate })
      })
      activityCount++
    }
  }

  console.log(`✅ Seeded ${createdCount} projects and ${createdCount + activityCount} activities.`)
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('Seeding error', err)
  process.exit(1)
})