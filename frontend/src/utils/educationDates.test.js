import { describe, expect, it } from 'vitest'
import { educationDateFields, formatStudyPeriod, studyDateErrors } from './educationDates'
import { buildResumePayload, normalizeResumeForm } from '@/pages/Admin/adminDashboardUtils'

describe('study dates', () => {
  it('displays ongoing studies with Present or an explicitly expected finish', () => {
    expect(formatStudyPeriod({ status: 'In progress', startDate: '2025-09', finishDate: '2026' })).toBe('Sep 2025 – Present')
    expect(formatStudyPeriod({ status: 'In progress', startDate: '2025-09', expectedFinishDate: '2027-06' })).toBe('Sep 2025 – Expected Jun 2027')
    expect(formatStudyPeriod({ status: 'Completed', startDate: '2021', finishDate: '2025' })).toBe('2021 – 2025')
  })
  it('preserves legacy periods and separates known legacy dates without inventing months', () => {
    expect(educationDateFields({ period: '2019 - 2023' })).toEqual({ startDate: '2019', finishDate: '2023', expectedFinishDate: '' })
    expect(formatStudyPeriod({ period: 'Autumn 2021 to Spring 2025' })).toBe('Autumn 2021 to Spring 2025')
    const form = normalizeResumeForm({ education: [{ period: '2025 – Present' }] })
    expect(form.education[0]).toMatchObject({ startDate: '2025', status: 'In progress' })
  })
  it('omits actual finish dates for ongoing studies in saved payloads', () => {
    const form = normalizeResumeForm({ education: [{ school: 'University', program: 'Data Science', status: 'In progress', startDate: '2025', finishDate: '2026', expectedFinishDate: '2027' }] })
    expect(buildResumePayload(form).education[0]).toMatchObject({ startDate: '2025', finishDate: '', expectedFinishDate: '2027', period: '2025 – Expected 2027' })
  })
  it('rejects malformed months and finishes before starts while allowing optional finishes', () => {
    expect(studyDateErrors({ startDate: '2025-13' })).toHaveProperty('startDate')
    expect(studyDateErrors({ startDate: '2025-09', finishDate: '2025-06' })).toHaveProperty('finishDate')
    expect(studyDateErrors({ status: 'In progress', startDate: '2025', expectedFinishDate: '2024' })).toHaveProperty('expectedFinishDate')
    expect(studyDateErrors({ status: 'In progress', startDate: '2025' })).toEqual({})
  })
})
