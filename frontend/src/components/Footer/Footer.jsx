// Footer.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classes from './Footer.module.css';
import {
  faBehance,
  faGithub,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const socialMediaLinks = [
  { id: 'github', icon: faGithub, title: 'GitHub', url: 'https://github.com/Ukandu20' },
  { id: 'linkedin', icon: faLinkedin, title: 'LinkedIn', url: 'https://www.linkedin.com/in/okechiukandu/' },
  { id: 'email', icon: faEnvelope, title: 'Email', url: 'mailto:oukandu2000@gmail.com' },
  { id: 'behance', icon: faBehance, title: 'Behance', url: 'https://www.behance.net/okechiukandu' },
];

export default function Footer() {
  return (
    <footer className={classes.footer}>
      <div className={classes.inner}>
        <p className={classes.copy}>© {new Date().getFullYear()} Okechi Ukandu</p>
        <div className={classes.icons}>
          {socialMediaLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              title={link.title}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.title}
            >
              <FontAwesomeIcon icon={link.icon} className={classes.icon} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
