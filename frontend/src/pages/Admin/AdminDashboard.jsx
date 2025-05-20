// src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classes from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    externalLink: '',
    githubLink: '',
    liveDemoLink: '',
    imageUrl: '',
    category: '',
    languages: '',
    status: '',
    tags: '',
    date: '',
    featured: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem('isAdminAuthenticated');
    const loginTime = sessionStorage.getItem('loginTime');

    if (isAuth && loginTime) {
      const now = Date.now();
      const sessionDuration = now - parseInt(loginTime, 10);
      const maxSessionDuration = 30 * 60 * 1000; // 30 minutes

      if (sessionDuration > maxSessionDuration) {
        sessionStorage.clear();
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        fetchProjects();
      }
    }
  }, []);

  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.clear();
        setIsAuthenticated(false);
      }, 15 * 60 * 1000); // 15 minutes inactivity
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timeout);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/projects',
        {
          ...formData,
          languages: formData.languages.split(',').map((lang) => lang.trim()),
          tags: formData.tags.split(',').map((tag) => tag.trim()),
          date: new Date(formData.date),
        },
        {
          headers: { 'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET },
        }
      );
      window.alert('Success! Project created successfully.');
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      window.alert('Error! Failed to create project.');
    }
  };

  const handleEditClick = (project) => {
    setEditMode(true);
    setEditingProjectId(project._id);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      externalLink: project.externalLink || '',
      githubLink: project.githubLink || '',
      liveDemoLink: project.liveDemoLink || '',
      imageUrl: project.imageUrl || '',
      category: project.category || '',
      languages: (project.languages || []).join(', '),
      status: project.status || '',
      tags: (project.tags || []).join(', '),
      date: project.date
        ? new Date(project.date).toISOString().substr(0, 10)
        : '',
      featured: project.featured || false,
    });
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/projects/${editingProjectId}`,
        {
          ...formData,
          languages: formData.languages.split(',').map((lang) => lang.trim()),
          tags: formData.tags.split(',').map((tag) => tag.trim()),
          date: new Date(formData.date),
        },
        {
          headers: { 'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET },
        }
      );
      window.alert('Success! Project updated successfully.');
      setEditMode(false);
      setEditingProjectId(null);
      setFormData({
        title: '',
        description: '',
        externalLink: '',
        githubLink: '',
        liveDemoLink: '',
        imageUrl: '',
        category: '',
        languages: '',
        status: '',
        tags: '',
        date: '',
        featured: false,
      });
      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      window.alert('Error! Failed to update project.');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?'))
      return;
    try {
      await axios.delete(`/api/projects/${id}`, {
        headers: { 'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET },
      });
      window.alert('Success! Project deleted successfully.');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      window.alert('Error! Failed to delete project.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={classes.adminDashboard}>
        <h1>Admin Login</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (passwordInput === import.meta.env.VITE_ADMIN_SECRET) {
              sessionStorage.setItem('isAdminAuthenticated', 'true');
              sessionStorage.setItem('loginTime', Date.now());
              setIsAuthenticated(true);
              fetchProjects();
            } else {
              window.alert('Error! Incorrect password!');
            }
          }}
        >
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className={classes.adminDashboard}>
      <h1>Admin Dashboard</h1>
      <form
        onSubmit={editMode ? handleUpdateProject : handleCreateProject}
        className={classes.projectForm}
      >
        <h2>{editMode ? 'Edit Project' : 'Create New Project'}</h2>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="externalLink"
          placeholder="External Link"
          value={formData.externalLink}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="githubLink"
          placeholder="GitHub Link"
          value={formData.githubLink}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="liveDemoLink"
          placeholder="Live Demo Link"
          value={formData.liveDemoLink}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL"
          value={formData.imageUrl}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="languages"
          placeholder="Languages (comma separated)"
          value={formData.languages}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated)"
          value={formData.tags}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
        <label>
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleInputChange}
          />
          Featured Project
        </label>
        <button type="submit">
          {editMode ? 'Update Project' : 'Create Project'}
        </button>
        {editMode && (
          <button
            type="button"
            onClick={() => {
              setEditMode(false);
              setEditingProjectId(null);
              setFormData({
                title: '',
                description: '',
                externalLink: '',
                githubLink: '',
                liveDemoLink: '',
                imageUrl: '',
                category: '',
                languages: '',
                status: '',
                tags: '',
                date: '',
                featured: false,
              });
            }}
            style={{
              marginLeft: '10px',
              backgroundColor: 'grey',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className={classes.projectList}>
        <h2>Existing Projects</h2>
        <ul>
          {projects.map((project) => (
            <li key={project._id}>
              <strong>{project.title}</strong> - {project.category}
              <button onClick={() => handleEditClick(project)}>Edit</button>
              <button onClick={() => handleDeleteProject(project._id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
