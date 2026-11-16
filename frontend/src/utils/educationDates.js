export const isStudyInProgress = (status = '') => /^in[ -]progress$/i.test(status.trim())

// Year precision remains useful for older entries; months can be added when known.
export const isStudyDate = (value) => !value || /^\d{4}(-(0[1-9]|1[0-2]))?$/.test(value)

export function educationDateFields(item = {}) {
  if (item.startDate || item.finishDate || item.expectedFinishDate) return {
    startDate: item.startDate || '', finishDate: item.finishDate || '', expectedFinishDate: item.expectedFinishDate || '',
  }
  const match = (item.period || '').match(/^(\d{4}(?:-\d{2})?)\s+(?:-|–|—)\s+(\d{4}(?:-\d{2})?|Present)$/i)
  return { startDate: match?.[1] || '', finishDate: match && match[2].toLowerCase() !== 'present' ? match[2] : '', expectedFinishDate: '' }
}

export function formatStudyPeriod(item = {}) {
  const { startDate, finishDate, expectedFinishDate } = educationDateFields(item)
  const format = value => value?.length === 7 && isStudyDate(value)
    ? new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}-01T00:00:00Z`))
    : value
  const ongoing = isStudyInProgress(item.status) || (!item.status && /present/i.test(item.period || ''))
  const finish = ongoing ? (expectedFinishDate ? `Expected ${format(expectedFinishDate)}` : 'Present') : format(finishDate)
  return [format(startDate), finish].filter(Boolean).join(' – ') || item.period || ''
}

export function studyDateErrors(item) {
  const errors = {}
  const finishKey = isStudyInProgress(item.status) ? 'expectedFinishDate' : 'finishDate'
  for (const key of ['startDate', finishKey]) {
    if (!isStudyDate(item[key])) errors[key] = 'Use a year (2025) or year and month (2025-09).'
  }
  if (!errors.startDate && !errors[finishKey] && item.startDate && item[finishKey] && item[finishKey].slice(0, item.startDate.length) < item.startDate.slice(0, item[finishKey].length)) {
    errors[finishKey] = 'The finish must be on or after the start.'
  }
  return errors
}
