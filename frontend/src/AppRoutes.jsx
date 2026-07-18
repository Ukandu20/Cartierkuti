// AppRoutes.jsx
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Error404 from './components/Error/Error404';
import { LoadingState } from './components/ui/StateFeedback';

const Home = React.lazy(() => import('./pages/Home/Home'));
const Portfolio = React.lazy(() => import('./pages/Portfolio/Portfolio'));
const About = React.lazy(() => import('./pages/About/About'));
const AdminDashboard = React.lazy(() => import('./pages/Admin/AdminDashboard'));
const AboutEditor = React.lazy(() => import('./pages/Admin/AboutEditor'));
const AdminSecurity = React.lazy(() => import('./pages/Admin/AdminSecurity'));
const AdminRecovery = React.lazy(() => import('./pages/Admin/AdminRecovery'));
const AdminResetPassword = React.lazy(() => import('./pages/Admin/AdminResetPassword'));
const Contact = React.lazy(() => import('./pages/Contact/Contact'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingState label="Loading page..." />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/about" element={<AboutEditor />} />
        <Route path="/admin/security" element={<AdminSecurity />} />
        <Route path="/admin/recover" element={<AdminRecovery />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
