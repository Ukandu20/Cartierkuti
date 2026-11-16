export const visibleProfileMetrics = (metrics = []) =>
  metrics.filter(metric => !/^projects$/i.test((metric.label || '').trim()))
