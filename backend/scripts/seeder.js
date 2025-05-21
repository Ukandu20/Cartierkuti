#!/usr/bin/env node
// scripts/seeder.js

import dotenv from 'dotenv';
dotenv.config(); // loads MONGODB_URI & NODE_ENV

// Only run in production
if (process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  Real seeder only runs in production');
  process.exit(0);
}

import mongoose from 'mongoose';
import { projectData } from '../src/assets/data/data.js'; // your curated list
import Project from '../src/models/project.model.js';

async function importData() {
  try {
    // 1) connect
    await mongoose.connect(process.env.MONGODB_URI, {
      serverApi: { version: '1', strict: true, deprecationErrors: true },
    });

    // 2) clear existing real data
    await Project.deleteMany({});

    // 3) insert your curated projects
    await Project.insertMany(projectData);

    console.log(`✅ Seeded ${projectData.length} real projects`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error importing project data:', err);
    process.exit(1);
  }
}

importData();
