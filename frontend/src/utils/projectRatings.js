export function getProjectRating(project = {}) {
  const reviews = Array.isArray(project.reviews) ? project.reviews : []
  const ratings = reviews.map(review => review.stars).filter(Number.isFinite)
  return {
    reviewCount: Number.isFinite(project.reviewCount) ? project.reviewCount : reviews.length,
    avgStars: Number.isFinite(project.avgStars) ? project.avgStars
      : ratings.length ? Math.round(ratings.reduce((sum, value) => sum + value, 0) / ratings.length * 100) / 100 : 0,
  }
}
