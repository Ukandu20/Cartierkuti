import React from 'react'
import classes from './Navbar.modules.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons'; // Updated icon import
import logoImage from './logo1.png'; // Import the logo image


export default function Navbar() {
    const resume = () => {
        // Create a link element
        const link = document.createElement('a');
        link.href = 'resume.pdf';
        link.target = '_blank'; // Open the link in a new tab
        link.download = 'resume.pdf'; // Set the desired filename for the downloaded file
        document.body.appendChild(link); // Append the link to the body
        link.click(); // Programmatically trigger the click event on the link
        document.body.removeChild(link); // Remove the link from the body after clicking
};


    return (
            <div className={classes.nav}>
                <nav>
                    <ul className={classes.nav_logo}>
                        <li>
                            <a href='/' className={window.location.pathname === '/' ? 'active' : ''}>
                            <img src={logoImage} width='105px' height='60px' alt='logo' /> {/* Use the imported logo image */}                              
                            </a>
                        </li>
                    </ul>
                    <ul className={classes.nav_links}>                  
                        <li>
                            <a href='/about' className={window.location.pathname === '/about' ? 'active' : ''}>
                                About
                            </a>
                        </li>
                        <li>
                            <a href='/portfolio' className={window.location.pathname === '/portfolio' ? 'active' : ''}>
                                Portfolio
                            </a>
                        </li>
                        <li>
                            <a href='/contact' className={window.location.pathname === '/contact' ? 'active' : ''}>
                                Contact
                            </a>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <button className={classes.nav_resume} onClick={resume}>Resume <FontAwesomeIcon icon={faDownload} />
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
            );
}
