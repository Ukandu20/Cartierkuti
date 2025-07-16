// scripts/dynamicseeder.js

import dotenv from 'dotenv';
dotenv.config(); // Load MONGODB_URI & NODE_ENV

// Prevent seeding fake data in production
if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  Dynamic seeder disabled in production');
  process.exit(0);
}

import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Project from '../src/models/project.model.js';

/* ─────────────── helper to build ratings & avg */
function makeRatings() {
  const list = Array.from({ length: faker.number.int({ min: 4, max: 10 }) }).map(() => ({
    stars: faker.number.int({ min: 1, max: 5 }),
    comment: faker.lorem.sentence(),
    date: faker.date.recent(90),
  }));
  const avg = list.reduce((sum, r) => sum + r.stars, 0) / list.length;
  return { list, avg };
}

/* ─────────────── generate fake projects array */
function generateFakeProjects(count = 50) {
  return Array.from({ length: count }).map((_, idx) => {
    const featuredBool = faker.datatype.boolean();
    const { list: ratings, avg: avgStars } = makeRatings();

    return {
      id: idx + 1,
      category: faker.helpers.arrayElement([
        'Web Development',
        'Data Analysis',
        'Machine Learning/AI',
        'Data Science',
        'Other',
      ]),
      title: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      languages: faker.helpers.arrayElements(
        ['React', 'Node.js', 'Express', 'MongoDB', 'Python', 'Java', 'Flutter', 'Next.js', 'TypeScript'],
        faker.number.int({ min: 2, max: 4 })
      ),
      status: faker.helpers.arrayElement(['In Progress', 'Completed']),
      tags: faker.helpers.arrayElements(
        ['Frontend', 'Backend', 'Fullstack', 'Data Analysis', 'Design'],
        faker.number.int({ min: 1, max: 3 })
      ),
      metadata: faker.internet.url(),
      externalLink: faker.internet.url(),
      githubLink: faker.internet.url(),
      liveDemoLink: faker.internet.url(),
      imageUrl: faker.image.urlLoremFlickr({ category: 'technology' }),
      date: faker.date.past(),
      featured: featuredBool,
      // convenience for front‐end
      isFeatured: featuredBool,
      views: faker.number.int({ min: 25, max: 500 }),
      ratings,
      avgStars,
    };
  });
}

/* ─────────────── main seeding routine */
async function seedFakeProjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverApi: { version: '1', strict: true, deprecationErrors: true },
    });

    // wipe out any existing fake data
    await Project.deleteMany();

    const fakeProjects = generateFakeProjects(50);
    await Project.insertMany(fakeProjects);

    console.log(`✅ Seeded ${fakeProjects.length} fake projects!`);
    console.table(
      fakeProjects.map((p) => ({
        id:        p.id,
        title:     p.title,
        views:     p.views,
        avgStars:  p.avgStars.toFixed(1),
        featured:  p.featured,
      }))
    );
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
  }
}

seedFakeProjects();
