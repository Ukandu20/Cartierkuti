// src/components/Contact/Contact.jsx
import React from 'react';
import { useChakraContext } from '@chakra-ui/react';

export const Contact = () => {
  const { colorMode } = useChakraContext();

  // Compute light/dark values manually
  const bg = colorMode === 'light' ? '#f9f9f9' : '#1c1e26';
  const text = colorMode === 'light' ? '#1a202c' : '#ffffff';
  const accent = colorMode === 'light' ? '#3182ce' : '#00c3ff';
  const accentHover = colorMode === 'light' ? '#2b6cb0' : '#00a1cc';
  const secondaryText = colorMode === 'light' ? '#4a5568' : '#ccc';

  const styles = {
    contact: {
      padding: '3rem 2rem 1.5rem',
      background: bg,
      color: text,
      textAlign: 'center',
      marginBottom: '2rem',
    },
    section_title: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '1.2rem',
    },
    contact_text: {
      maxWidth: '50ch',
      fontSize: '1.1rem',
      margin: '0 auto 2rem',
      opacity: 0.9,
    },
    cta_btn: {
      display: 'inline-block',
      padding: '0.9rem 2rem',
      fontWeight: 600,
      borderRadius: '40px',
      background: accent,
      color: '#fff',
      fontSize: '1.05rem',
      textDecoration: 'none',
      transition: 'all 0.25s ease-in-out',
      boxShadow: '0 6px 20px rgba(0, 195, 255, 0.2)',
    },
    cta_btn_hover: {
      background: accentHover,
    },
    email_text: {
      marginTop: '1.3rem',
      fontSize: '0.95rem',
      color: secondaryText,
    },
    email_link: {
      color: accent,
      textDecoration: 'none',
    },
    socials: {
      marginTop: '2rem',
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem',
      fontSize: '1rem',
    },
    social_link: {
      color: accent,
      textDecoration: 'none',
      fontWeight: 500,
      transition: 'color 0.3s ease',
    },
  };

  return (
    <section style={styles.contact} id="contact">
      <h2 style={styles.section_title}>Interested in Working Together?</h2>

      <p style={styles.contact_text}>
        I&apos;m always open to discussing exciting ideas, collaborations, or new opportunities.
      </p>

      <a
        href="mailto:cartierkuti@gmail.com"
        style={styles.cta_btn}
        onMouseOver={(e) => (e.currentTarget.style.background = styles.cta_btn_hover.background)}
        onMouseOut={(e) => (e.currentTarget.style.background = styles.cta_btn.background)}
      >
        Say Hello
      </a>

      <p style={styles.email_text}>
        or email me directly at{' '}
        <a href="mailto:cartierkuti@gmail.com" style={styles.email_link}>
          cartierkuti@gmail.com
        </a>
      </p>

      <div style={styles.socials}>
        <a
          href="https://linkedin.com/in/YOUR-HANDLE"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.social_link}
        >
          LinkedIn
        </a>
        <a
          href="https://github.com/YOUR-HANDLE"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.social_link}
        >
          GitHub
        </a>
        <a
          href="https://behance.net/YOUR-HANDLE"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.social_link}
        >
          Behance
        </a>
      </div>
    </section>
  );
};

export default Contact;
