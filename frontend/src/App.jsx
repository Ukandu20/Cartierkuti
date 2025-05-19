import React from 'react';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './AppRoutes';
import Footer from './components/Footer/Footer';


const App = () => {
  return (
    <>
      <div style={{ position: 'relative', top: '20px', left: '20px', zIndex: 1000 }}>
      </div>
      <Navbar />
      <AppRoutes />
      <Footer />
    </>
  );
};

export default App;
