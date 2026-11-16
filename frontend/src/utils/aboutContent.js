export const aboutTextFields = [
  ['pageTitle', 'Browser page title', 'About | Preston Ukandu'],
  ['metaDescription', 'Search description', 'Meet Preston Ukandu, a data science and sports analytics practitioner who turns complex evidence into useful models, dashboards, and decisions.'],
  ['introductionLabel', 'Introduction label', 'About / Data science & sports analytics'],
  ['heroTitle', 'Main page heading', 'I make analytical work useful, explainable, and ready for decisions.'],
  ['educationLabel', 'Education section label', 'Education'],
  ['experienceLabel', 'Experience section label', '01 / Experience'],
  ['experienceTitle', 'Experience section heading', 'An engineering foundation, applied through analytics.'],
  ['credentialsLabel', 'Credentials section label', 'Credentials'],
  ['processLabel', 'Working approach label', '02 / How I work'],
  ['processTitle', 'Working approach heading', 'Rigour matters. So does usefulness.'],
  ['processDescription', 'Working approach introduction', 'My process connects sound analysis to the people and decisions it is meant to serve.'],
  ['capabilitiesLabel', 'Capabilities section label', '03 / Capabilities'],
  ['capabilitiesTitle', 'Capabilities section heading', 'From raw data to a clear next move.'],
  ['capabilitiesDescription', 'Capabilities introduction', 'I combine analytical methods, visual communication, and software delivery so insights do not stop at a notebook.'],
  ['primarySkillsLabel', 'Primary skills group label', 'Analysis and modelling'],
  ['secondarySkillsLabel', 'Secondary skills group label', 'Visualisation and delivery'],
  ['toolsSkillsLabel', 'Tools group label', 'Engineering and tools'],
  ['personalLabel', 'Personal section label', 'A little more about me'],
  ['personalTitle', 'Personal section heading', 'Outside my work'],
  ['galleryLabel', 'Gallery section label', 'Places, people, and moments'],
  ['galleryTitle', 'Gallery section heading', 'Experiences in pictures'],
  ['ctaLabel', 'Contact invitation label', "Let's work together"],
  ['ctaTitle', 'Contact invitation heading', 'Have a data problem or a sports analytics idea?'],
  ['ctaDescription', 'Contact invitation description', 'I am interested in thoughtful projects where evidence can make a real decision clearer.'],
  ['contactButtonLabel', 'Contact button text', 'Start a conversation'],
  ['resumeButtonLabel', 'Download button text', 'Download résumé'],
  ['credentialButtonLabel', 'Credential button text', 'View credential'],
]

export const defaultPrinciples = [
  { title: 'Frame the question', description: 'Start with the decision, define what success means, and identify the evidence that can support it.' },
  { title: 'Build and evaluate', description: 'Clean the data, choose an honest method, and test whether the result holds beyond a single metric.' },
  { title: 'Make it useful', description: 'Turn the analysis into a dashboard, narrative, or product that makes the next action clearer.' },
]

export const normalizeAboutContent = (content = {}) => ({
  ...Object.fromEntries(aboutTextFields.map(([key, , value]) => [key, value])),
  principles: defaultPrinciples.map(item => ({ ...item })),
  ...content,
})
