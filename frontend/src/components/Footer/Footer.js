import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classes from './Footer.module.css'
import {  faBehance, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';



export default function footer() {
  return (

        <footer className={classes.footer}>
          <div className={classes.footer_container}>
            <div className={classes.social_links}>
              <p>Connect with me</p>
              <a href="https://github.com/Ukandu20" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faGithub} className={classes.icons}/>
              </a>
              <a href="https://www.linkedin.com/in/okechiukandu/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faLinkedin} className={classes.icons}/>
              </a>
              <a href="mailto:oukandu2000@gmail.com" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faEnvelope} className={classes.icons}/>
              </a>
              <a href="https://www.behance.net/okechiukandu" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faBehance} className={classes.icons}/>
              </a>

            </div>
          </div>
        </footer>
      );
}
