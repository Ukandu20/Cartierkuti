// scripts/dynamicseeder.js
import 'dotenv/config';   // loads MONGODB_URI & NODE_ENV
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Project from '../src/models/project.model.js';

if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  Dynamic seeder disabled in production');
  process.exit(0);
}

function makeReviews() {
  return Array.from({ length: faker.number.int({ min: 4, max: 10 }) })
    .map(() => ({
      stars:   faker.number.int({ min: 1, max: 5 }),
      comment: faker.lorem.sentence(),
      date:    faker.date.recent(90),
    }));
}

function generateFakeProjects(count = 50) {
  return Array.from({ length: count }).map(() => {
    // Pick a createdDate up to a year ago...
    const createdDate     = faker.date.past({ years: 1 });
    // ...and an updated date between createdDate and now
    const lastUpdatedDate = faker.date.between({
      from: createdDate,
      to:   new Date()
    });

    return {
      category:     faker.helpers.arrayElement([
        'Web Development',
        'Data Analysis',
        'Machine Learning/AI',
        'Data Science',
        'Other',
      ]),
      title:        faker.commerce.productName(),
      description:  faker.lorem.paragraph(),
      languages:    faker.helpers.arrayElements(
                       ['React','Node.js','Express','MongoDB','Python','Java','Flutter','Next.js','TypeScript'],
                       faker.number.int({ min: 2, max: 4 })
                     ),
      status:       faker.helpers.arrayElement(['In Progress','Completed']),
      tags:         faker.helpers.arrayElements(
                       ['Frontend','Backend','Fullstack','Data Analysis','Design'],
                       faker.number.int({ min: 1, max: 3 })
                     ),
      metadata:     faker.internet.url(),
      externalLink: faker.internet.url(),
      githubLink:   faker.internet.url(),
      liveDemoLink: faker.internet.url(),
      imageUrl:     faker.image.urlLoremFlickr({ category: 'technology' }),
      featured:     faker.datatype.boolean(),
      views:        faker.number.int({ min: 25, max: 500 }),
      reviews:      makeReviews(),

      // explicit timestamps for Mongoose
      createdDate,
      lastUpdatedDate,
    };
  });
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  });

  console.log('🧹  Clearing existing…');
  await Project.deleteMany();

  const docs = generateFakeProjects(50);

  try {
    const inserted = await Project.insertMany(docs, { ordered: false });
    console.log(`✅ Inserted ${inserted.length}/${docs.length} projects`);
  } catch (err) {
    if (err.name === 'BulkWriteError') {
      console.warn(`⚠️ Skipped ${err.writeErrors.length} bad docs`);
    } else {
      console.error(err);
    }
  }

  process.exit(0);
}

seed();
