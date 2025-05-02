import React from 'react';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './AppRoutes';
import Footer from './components/Footer/Footer';
import Contact from './components/Contact/Contact';

const App = () => {
  return (
    <>
      <div style={{ position: 'relative', top: '20px', left: '20px', zIndex: 1000 }}>
      </div>
      <Navbar />
      <AppRoutes />
      <Contact />
      <Footer />
    </>
  );
};

export default App;
