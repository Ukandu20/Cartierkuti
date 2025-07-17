// scripts/dynamicseeder.js
import dotenv from 'dotenv';
dotenv.config(); // loads MONGODB_URI & NODE_ENV

// NEVER seed prod
if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  Dynamic seeder disabled in production');
  process.exit(0);
}

import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Project from '../src/models/project.model.js';

// flag to force wipe
const shouldWipe = process.argv.includes('--wipe');

function makeRatings() {
  const list = Array.from(
    { length: faker.number.int({ min: 4, max: 10 }) }
  ).map(() => ({
    stars:   faker.number.int({ min: 1, max: 5 }),
    comment: faker.lorem.sentence(),
    date:    faker.date.recent(90),
  }));
  const avgStars = list.reduce((sum, r) => sum + r.stars, 0) / list.length;
  return { list, avgStars };
}

function generateFakeProjects(count = 50) {
  return Array.from({ length: count }).map(() => {
    const { list: ratings, avgStars } = makeRatings();
    return {
      category: faker.helpers.arrayElement([
        'Web Development',
        'Data Analysis',
        'Machine Learning/AI',
        'Data Science',
        'Other',
      ]),
      title:         faker.commerce.productName(),
      description:   faker.lorem.paragraph(),
      languages:     faker.helpers.arrayElements(
                       ['React','Node.js','Express','MongoDB','Python','Java','Flutter','Next.js','TypeScript'],
                       faker.number.int({ min: 2, max: 4 })
                     ),
      status:        faker.helpers.arrayElement(['In Progress','Completed']),
      tags:          faker.helpers.arrayElements(
                       ['Frontend','Backend','Fullstack','Data Analysis','Design'],
                       faker.number.int({ min: 1, max: 3 })
                     ),
      metadata:      faker.internet.url(),
      externalLink:  faker.internet.url(),
      githubLink:    faker.internet.url(),
      liveDemoLink:  faker.internet.url(),
      imageUrl:      faker.image.urlLoremFlickr({ category: 'technology' }),
      date:          faker.date.past(),
      featured:      faker.datatype.boolean(),
      views:         faker.number.int({ min: 25, max: 500 }),
      ratings,
      avgStars,
    };
  });
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  });

  if (shouldWipe) {
    console.log('🧹  Wiping all existing projects…');
    await Project.deleteMany({});
  }

  const fakeProjects = generateFakeProjects(50);

  // Bulk upsert: only insert if title missing
  const ops = fakeProjects.map(p => ({
    updateOne: {
      filter: { title: p.title },
      update: { $setOnInsert: p },
      upsert: true,
    }
  }));

  try {
    const res = await Project.bulkWrite(ops, { ordered: false });
    console.log(`✅ Upserted ${res.upsertedCount} new projects.`);
  } catch (err) {
    console.warn('⚠️ Some inserts failed but were skipped:', err.writeErrors?.length, 'errors');
  }

  process.exit(0);
}

seed();
