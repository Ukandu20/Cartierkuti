// assets/data/data.js

export const projectData = [
  {
    id: 1,
    category:     'Web Development',
    title:        'Personal Portfolio Website',
    description:  'A React/Vite site to showcase my projects and blog posts.',
    languages:    ['React', 'Vite', 'TailwindCSS', 'Node.js'],
    status:       'Completed',
    tags:         ['Portfolio', 'Frontend'],
    metadata:     'Built with React, Vite, and deployed on Netlify',
    externalLink: 'https://cartierkuti.com',
    githubLink:   'https://github.com/Ukandu20/Cartierkuti',
    liveDemoLink: 'https://cartierkuti.com',
    imageUrl:     'https://example.com/assets/portfolio-1.png',
    date:         new Date('2024-03-15'),
    featured:     true
  },
  {
    id: 2,
    category:     'Data Science',
    title:        'Sales Forecast Model',
    description:  'A Python ML model forecasting sales using time-series data.',
    languages:    ['Python', 'Pandas', 'scikit-learn'],
    status:       'Completed',
    tags:         ['Machine Learning', 'Data Analysis'],
    metadata:     'Uses ARIMA and Random Forest regressors',
    externalLink: 'https://your-docs.example.com/sales-forecast',
    githubLink:   'https://github.com/Ukandu20/sales-forecast',
    liveDemoLink: '',
    imageUrl:     'https://example.com/assets/forecast.png',
    date:         new Date('2024-06-01'),
    featured:     false
  },
  // …extend with your other real projects
];
