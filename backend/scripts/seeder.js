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

    await Project.deleteMany({})
    await Project.insertMany(projectData)

    console.log(`Seeded ${projectData.length} real projects`)
    process.exit(0)
  } catch (err) {
    console.error('Error importing project data:', err)
    process.exit(1)
  }
}

importData()
