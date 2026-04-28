import React from 'react';
import classes from './Error404.module.css'; // Import the CSS module

export default function Error404() {
  return (
    <div className={classes.error_container}>
      <h1 className={classes.error_title}>404 - Page Not Found</h1>
      <p className={classes.error_message}>
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
