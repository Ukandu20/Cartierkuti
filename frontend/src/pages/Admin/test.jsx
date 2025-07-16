import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import classes from './AdminDashboard.module.css';
import { Card, Heading, Stack, Flex, Text, Icon, SimpleGrid, Box, VStack} from "@chakra-ui/react";
import { useColorMode } from '../../components/Theme/color-mode'
import { HiFolderOpen, HiEye, HiPlay, HiStar } from 'react-icons/hi';

const AdminDashboard = () => {
    const { colorMode } = useColorMode()
    const accent = '#05e2d7'
  
    /* palette */
    const iconBg    = colorMode === 'light' ? 'gray.700'    : 'whiteAlpha.800'
    const fieldBg    = colorMode === 'light' ? 'gray.100'    : 'whiteAlpha.100'
    const idleTxt    = colorMode === 'light' ? 'gray.700'    : 'whiteAlpha.800'



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

  const recentProjects = useMemo(
    () =>
      [...projects]
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        .slice(0, 5),
    [projects]
  );

  const started = projects.filter((p) => p.status === "active").length;
  const finished = projects.filter((p) => p.status === "completed")
    .length;
  const total = projects.length;

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

  const kpis = [
  {
    label: "Total Projects",
    value: projects.length,
    desc: "completed & launched projects",
    icon: HiFolderOpen,
  },
  {
    label: "Active Projects",
    value: projects.filter(p => p.status === 'active').length,
    desc: "in progress",
    icon: HiPlay,
  },
  {
    label: "Most Viewed Projects",
    value: projects.length
      ? Math.max(...projects.map(p => p.views || 0))
      : 0,
    desc: "your popularity stat",
    icon: HiEye,
  },
  {
    label: "Featured Projects",
    value: projects.filter(p => p.featured).length,
    desc: "my best projects",
    icon: HiStar,
  },
  ] ;

  return (

    <div className={classes.body}>
      <h2>Welcome Back!</h2>
      <p>here's whats going on with your projects</p>


      <SimpleGrid minChildWidth="240px" spaceX={6} mb={8}>
        {kpis.map(({ label, value, desc, icon: IconComp }) => (
          <Card.Root key={label} p={4} bg={fieldBg}>
            <Card.Header fontSize="md" fontWeight="bold">
              {label}
            </Card.Header>

            <Card.Body>
              <Flex align="center" justify="space-between">
                <Text fontSize="2xl" fontWeight="bold">
                  {value}
                </Text>
                <Icon as={IconComp} boxSize={12} color={accent} />
              </Flex>
            </Card.Body>

            <Card.Description>
              <Text fontSize="xs" color={idleTxt}>
                {desc}
              </Text>
            </Card.Description>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Box mb={10}>
              <SimpleGrid
                columns={{ base: 1, md: 2 }}
                spacingX={6}    // horizontal gutter
                spacingY={4}    // vertical gutter (in case it wraps)
              >
                {/* ── Recent Activity Column ── */}
                <Box>
                  <Heading size="md" mb={4}>
                    Recent Activity
                  </Heading>

                  <VStack spacing={4} align="stretch">
                    {recentProjects.map((p) => (
                      <Card.Root
                        key={p._id}
                        p={4}
                        bg={fieldBg}
                        boxShadow="sm"
                        borderRadius="md"
                      >
                        <Flex justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            {p.title}
                          </Text>
                          <Text fontSize="xs" color={idleTxt}>
                            {new Date(p.date).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </Flex>
                        <Text fontSize="xs" color="gray.400">
                          {p.description || "No details available."}
                        </Text>
                      </Card.Root>
                    ))}

                    {recentProjects.length === 0 && (
                      <Text fontSize="sm" color="gray.500">
                        No recent activity.
                      </Text>
                    )}
                  </VStack>
                </Box>

                {/* ── Quick Insights Column ── */}
                <Box>
                  <Heading size="md" mb={4}>
                    Quick Insights
                  </Heading>

                  <Card.Root p={4} bg={fieldBg} boxShadow="sm" borderRadius="md">
                    <Card.Header fontSize="md" fontWeight="bold" mb={3}>
                      Project Status
                    </Card.Header>
                    <Card.Body>
                      <Stack spacing={3}>
                        <Flex justify="space-between">
                          <Text>Started</Text>
                          <Text fontWeight="bold">{started}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text>Finished</Text>
                          <Text fontWeight="bold">{finished}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text>Total</Text>
                          <Text fontWeight="bold">{total}</Text>
                        </Flex>
                      </Stack>
                    </Card.Body>
                  </Card.Root>
                </Box>
              </SimpleGrid>
            </Box>



        <div className={classes.adminDashboard}>
          <h1>Welcome to the Admin Dashboard</h1>
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
    </div>
    
  );
};

export default AdminDashboard;
