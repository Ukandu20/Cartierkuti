// Navbar.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar component', () => {
  test('renders Navbar with logo and links', () => {
    render(<Navbar />);
    
    const logoElement = screen.getByAltText('logo');
    const aboutLink = screen.getByRole('link', { name: /about/i });
    const portfolioLink = screen.getByRole('link', { name: /portfolio/i });
    const contactLink = screen.getByRole('link', { name: /contact/i });
    const resumeButton = screen.getByRole('button', { name: /resume/i });

    expect(logoElement).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
    expect(portfolioLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
    expect(resumeButton).toBeInTheDocument();
  });

  test('clicking resume button triggers download', () => {
    render(<Navbar />);
    
    const resumeButton = screen.getByRole('button', { name: /resume/i });

    // Mock the download functionality
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          target: '',
          download: '',
          click: jest.fn(),
        };
      }
      return originalCreateElement(tag);
    });

    fireEvent.click(resumeButton);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.createElement().href).toBe('resume.pdf');
    expect(document.createElement().target).toBe('_blank');
    expect(document.createElement().download).toBe('resume.pdf');
    expect(document.createElement().click).toHaveBeenCalled();

    // Restore the original createElement function
    document.createElement = originalCreateElement;
  });
});
