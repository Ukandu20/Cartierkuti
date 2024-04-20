import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classes from './Portfolio.module.css';

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('All');
  const [activeProject, setActiveProject] = useState(null);
  const [projects, setProjects] = useState([]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleViewProject = (event, metadata, externalLink) => {
    event.preventDefault();
    console.log(`You are viewing project with metadata: ${metadata}`);
    console.log(`External link: ${externalLink}`);
    window.open(externalLink, '_blank');
  };

  const toggleActiveProject = (projectId) => {
    setActiveProject(activeProject === projectId ? null : projectId);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const renderProjectTab = () => {
    const filteredProjects = activeTab === 'All' ? projects : projects.filter(project => project.tags.includes(activeTab));
    
    return (
      <div className={classes.container}>
        <div className={classes.row}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`${classes.card} ${activeProject === project.id ? classes.activeCard : ''}`}
              onClick={() => toggleActiveProject(project.id)}
            >
              <div className={classes.servicesText}>
                <div className={classes.card_body}>
                  <div className={classes.title}>
                    <h2 className={classes.card_title}>{project.title}</h2>
                    <h4 className={classes.card_info}>{project.date}</h4>
                  </div>
                  {activeProject === project.id ? (
                    <>
                      <img src={`${project.imageUrl}`} alt={project.title} className={classes.card_image} />
                      <p className={classes.card_info}>{project.description}</p>
                      <div className={classes.buttonGroup}>
                        <a href={project.externalLink} target="_blank" rel="noopener noreferrer" className={classes.button} onClick={(e) => handleViewProject(e, project.metadata, project.externalLink)}>
                          Github
                        </a>
                        <button className={classes.button} onClick={(e) => handleViewProject(e, project.metadata, project.externalLink)}>
                          Live Demo
                        </button>
                      </div>
                      <div className={classes.tags}>
                        {project.tags.map((tag) => (
                          <span key={tag} className={classes.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className={classes.hoverText}>Click to view more details</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className={classes.container}>
      <h1 className={classes.heading}>Projects</h1>
      <div className={classes.statement}>
        <h2>
          Explore my portfolio <br /> to witness the intersection <br /> of creativity and functionality
        </h2>
      </div>
      <div className={classes.tabs}>
        <button
          className={activeTab === 'All' ? classes.activeTab : ''}
          onClick={() => handleTabClick('All')}
        >
          All
        </button>
        <button
          className={activeTab === 'Web Design & Development' ? classes.activeTab : ''}
          onClick={() => handleTabClick('Web Design & Development')}
        >
          Web Design & Development
        </button>
        <button
          className={activeTab === 'Data Visualization' ? classes.activeTab : ''}
          onClick={() => handleTabClick('Data Visualization')}
        >
          Data Visualization
        </button>
        <button
          className={activeTab === 'Machine Learning' ? classes.activeTab : ''}
          onClick={() => handleTabClick('Machine Learning')}
        >
          Machine Learning
        </button>
      </div>
      {renderProjectTab()}
    </div>
  );
}