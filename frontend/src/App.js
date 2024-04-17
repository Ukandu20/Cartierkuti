import React from 'react';



// Importing the Navbar component, which contains the navigation bar for the application
import Navbar from './components/Navbar/Navbar';
// Importing the AppRoutes component, which contains the routes for the application
import AppRoutes from './AppRoutes';
// Importing the Footer component, which contains the footer for the application
import Footer from './components/Footer/Footer';
import Contact from './components/Contact/Contact';


// The main App component, which renders the Navbar, AppRoutes, and Footer components
function App() {
  return (
    <> {/* Using the Fragment shorthand to wrap multiple components */}
      <Navbar /> {/* Rendering the Navbar component */}
      <AppRoutes /> {/*Rendering the AppRoutes component */}
      <Contact /> {/*Rendering the Contact component */}
      <Footer />{/*  Rendering the Footer component */}      
    </>
  );
}

// Exporting the App component for use in other parts of the application
export default App;