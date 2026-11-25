export const homeTextFields = [
  ['heroEyebrow', 'Hero introduction', 'Preston Ukandu · Data Science & Sports Analytics', 120],
  ['heroLead', 'Hero heading', 'Data science for', 100],
  ['heroAccent', 'Hero heading accent', 'clearer business and sports decisions.', 140],
  ['heroDescription', 'Hero description', 'I build decision-ready dashboards, analytical models, and reproducible data products—bringing rigorous data science to business questions and sports performance.', 500],
  ['workTitle', 'Selected projects heading', 'Selected projects.', 120],
  ['workDescription', 'Selected projects introduction', 'Explore the questions, methods, and results behind selected analytical projects.', 400],
  ['capabilitiesTitle', 'Capabilities heading', 'Three ways I approach the work.', 120],
  ['capability1Title', 'First capability title', 'Decision intelligence', 100],
  ['capability1Description', 'First capability description', 'Turn business questions into KPI systems, dashboards, forecasts, and concise analytical narratives.', 400],
  ['capability2Title', 'Second capability title', 'Applied data science', 100],
  ['capability2Description', 'Second capability description', 'Build and evaluate models with careful validation, transparent assumptions, and reproducible workflows.', 400],
  ['capability3Title', 'Third capability title', 'Sports analytics', 100],
  ['capability3Description', 'Third capability description', 'Study player and team performance, match trends, scouting questions, and the context behind the numbers.', 400],
  ['profileTitle', 'Profile heading', 'Analytical rigour, practical delivery.', 120],
  ['ctaEyebrow', 'Footer invitation label', 'Have a question worth measuring?', 120],
  ['ctaTitle', 'Footer invitation heading', "Let's turn it into something decision-ready.", 160],
  ['ctaDescription', 'Footer invitation description', 'Open to data science, dashboarding, and sports analytics collaborations.', 400],
]

export const normalizeHomeContent = (content) => Object.fromEntries(
  homeTextFields.map(([key, , fallback]) => [key, typeof content?.[key] === 'string' ? content[key] : fallback]),
)
