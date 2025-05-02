// AppRoutes.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Portfolio from './pages/Portfolio/Portfolio';
import About from './pages/About/About';
import Error404 from './components/Error/Error404';
import AdminDashboard from './pages/Admin/AdminDashboard'; // ✅ Import Admin Page

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/about" element={<About />} />
      <Route path="/admin" element={<AdminDashboard />} /> {/* ✅ Add Admin Route */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default AppRoutes;
