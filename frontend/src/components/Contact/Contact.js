import React from 'react'
import classes from './Contact.module.css'

export default function Contact() {
  return (
    <section className={classes.contact}>
            <div className={classes.contact_content}>
                <h2>Interested in Working <br/> With Me?</h2>
                <div className={classes.contact_info}>
                    <p>Let's connect and discuss, <a href="mailto:cartierkuti@gmail.com" target="_blank" rel="noopener noreferrer">@cartierkuti@gmail.com.</a></p>
                </div>
            </div>
        </section>
  )
}
