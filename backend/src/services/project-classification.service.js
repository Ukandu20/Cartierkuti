import Project from '../models/project.model.js'
import logger from '../logger.js'

const CATEGORY_MIGRATIONS = new Map([
  ['web development', 'Web Applications'],
  ['web application', 'Web Applications'],
  ['data analysis', 'Data Analytics & BI'],
  ['data analytics', 'Data Analytics & BI'],
  ['data engineering', 'Data Systems & Pipelines'],
  ['data pipelines', 'Data Systems & Pipelines'],
  ['data science', 'Machine Learning & Forecasting'],
  ['machine learning/ai', 'Machine Learning & Forecasting'],
  ['ai/ml', 'Machine Learning & Forecasting'],
  ['machine learning', 'Machine Learning & Forecasting'],
])

const unique = (items = []) => Array.from(new Set(items.filter(Boolean)))

export async function migrateProjectClassifications() {
  const projects = await Project.find({ classificationVersion: { $ne: 1 } })
    .select('+classificationVersion')

  let migrated = 0
  for (const project of projects) {
    const normalizedCategory = String(project.category || '').trim().toLowerCase()
    project.category = CATEGORY_MIGRATIONS.get(normalizedCategory) || project.category
    project.tools = unique(project.tools?.length ? project.tools : project.languages)
    project.methods = unique(project.methods)
    project.tags = unique(project.tags)

    if (/^fifa world cup forecaster$/i.test(project.title || '')) {
      project.category = 'Sports Analytics'
      if (!project.methods.length) {
        project.methods = ['Predictive Modeling', 'Tournament Forecasting', 'Model Evaluation']
      }
      project.tags = ['Football', 'FIFA World Cup', 'Tournament Prediction']
    }

    project.classificationVersion = 1
    await project.save()
    await Project.updateOne({ _id: project._id }, { $set: { classificationVersion: 1 } })
    migrated += 1
  }

  if (migrated) logger.info({ migrated }, 'Project classifications migrated')
  return migrated
}
