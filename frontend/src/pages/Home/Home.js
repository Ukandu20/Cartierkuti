import React from 'react';
import classes from './Home.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'; // Updated icon import
import Carousel  from '../../components/Carousel/Carousel';


export default function Home() {
  return (
    <div>
        <section className={classes.hero}>
            <div className={classes.hero_content}>
                <h1>Hey, I'm Preston</h1>
                <h2>Fullstack Developer</h2>
            <div className={classes.hero_info}>
                <p>
                    I am a Computer Science graduate from the University of Windsor, driven by a passion for software development, web development, data science, and data analytics.
                </p>
                <div className={classes.learn_more}>
                    <a href='/about' className={window.location.pathname === '/about' ? 'active' : ''}>
                        <span>Learn More</span>
                    <div className={classes.icon}>
                        <FontAwesomeIcon icon={faArrowUp} /> {/* Updated icon */}
                    </div>
                    </a>
                </div>
            </div>
            </div>
        </section>

        <section  className={classes.projects}>
            <div className={classes.projects_content}>
                <h2>Featured Projects</h2>
                <div className={classes.projects_info}>                    
                    <div className={classes.view_projects}>
                        <a href='/portfolio' className={window.location.pathname === '/portfolio' ? 'active' : ''}>
                            <span>Discover More</span>
                        <div className={classes.icon}>
                            <FontAwesomeIcon icon={faArrowUp} /> {/* Updated icon */}
                        </div>
                        </a>
                    </div>
                </div>                
            </div>
            <Carousel/>
        </section>    
    </div>    
  );
}