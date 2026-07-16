#!/usr/bin/env node
// scripts/seeder.js

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { projectData } from '../src/assets/data/data.js'
import Project from '../src/models/project.model.js'

dotenv.config()

if (process.env.NODE_ENV !== 'production') {
  console.warn('Real seeder only runs in production')
  process.exit(0)
}

async function importData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverApi: { version: '1', strict: true, deprecationErrors: true },
    })

    await Project.bulkWrite(
      projectData.map((project) => ({
        updateOne: {
          filter: { githubLink: project.githubLink },
          update: { $set: project },
          upsert: true,
        },
      })),
    )

    console.log(`Upserted ${projectData.length} real projects without deleting live data`)
    process.exit(0)
  } catch (err) {
    console.error('Error importing project data:', err)
    process.exit(1)
  }
}

importData()
