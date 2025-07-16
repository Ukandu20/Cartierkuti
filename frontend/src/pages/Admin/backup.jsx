// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  VStack,
  Stack,
  Icon,
  Spinner,
  Button,
  CloseButton,
  Alert,
} from '@chakra-ui/react';
import {
  HiFolderOpen,
  HiEye,
  HiPlay,
  HiStar,
  HiPlus,
  HiPencil,
  HiTrash,
} from 'react-icons/hi';
import { Card } from '@chakra-ui/react';
import { Toaster, toaster } from '@/components/ui/toaster'; 
import { useColorMode } from '../../components/Theme/color-mode'

// Reusable card component
const StatCard = ({ label, value, desc, IconComp, onClick, isDisabled }) => {
  const { colorMode } = useColorMode();
  const accent  = colorMode === 'light' ? 'teal.500'     : 'teal.300';
  const bg      = colorMode === 'light' ? 'gray.100'      : 'whiteAlpha.100';
  const idleTxt = colorMode === 'light' ? 'gray.700'      : 'whiteAlpha.800';

  return (
    <Card
      p={4}
      bg={bg}
      boxShadow="sm"
      borderRadius="md"
      _hover={{
        boxShadow: onClick && !isDisabled ? 'md' : undefined,
        cursor:    onClick && !isDisabled ? 'pointer' : undefined,
      }}
      onClick={isDisabled ? undefined : onClick}
      opacity={isDisabled ? 0.6 : 1}
    >
      <Card.Header fontSize="md" fontWeight="bold">{label}</Card.Header>
      <Card.Body>
        <Flex align="center" justify="space-between">
          <Icon as={IconComp} boxSize={10} color={accent} />
          <Text fontSize="2xl" fontWeight="bold">{value}</Text>
        </Flex>
      </Card.Body>
      <Card.Description>
        <Text fontSize="xs" color={idleTxt} opacity={0.7}>{desc}</Text>
      </Card.Description>
    </Card>
  );
};

export default function AdminDashboard() {
  const { colorMode } = useColorMode();

  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Fetch projects with cancel token
  useEffect(() => {
    const source = axios.CancelToken.source();
    axios.get('/api/projects', { cancelToken: source.token })
      .then(res => setProjects(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        if (!axios.isCancel(err)) {
          console.error(err);
          setError('Could not load projects.');
        }
      })
      .finally(() => setLoading(false));
    return () => source.cancel();
  }, []);

  // KPI cards
  const kpis = useMemo(() => [
    {
      label: 'Total Projects',
      value: projects.length,
      desc:  'All projects',
      icon:  HiFolderOpen,
      onClick: () => toaster.create({
        title: `${projects.length} Projects`,
        description: 'You have this many total projects.',
        type:  'info',
        closable: true,
        duration: 5000,
      }),
    },
    {
      label: 'Active Projects',
      value: projects.filter(p => p.status === 'active').length,
      desc:  'In progress',
      icon:  HiPlay,
      onClick: () => toaster.create({
        title: `${projects.filter(p=>p.status==='active').length} Active`,
        description: 'Currently in progress',
        type: 'info',
        closable: true,
        duration: 5000,
      }),
    },
    {
      label: 'Most Viewed',
      value: projects.length
        ? Math.max(...projects.map(p => p.views || 0))
        : 0,
      desc:  'Peak views',
      icon:  HiEye,
      onClick: () => toaster.create({
        title: `Top Views: ${Math.max(...projects.map(p=>p.views||0))}`,
        description: 'Your single highest view count',
        type: 'info',
        closable: true,
        duration: 5000,
      }),
    },
    {
      label: 'Featured Projects',
      value: projects.filter(p => p.featured).length,
      desc:  'Your best work',
      icon:  HiStar,
      onClick: () => toaster.create({
        title: `${projects.filter(p=>p.featured).length} Featured`,
        description: 'Marked as featured',
        type: 'info',
        closable: true,
        duration: 5000,
      }),
    },
  ], [projects]);

  // Quick actions
  const quickActions = useMemo(() => [
    {
      label: 'Add New Project',
      value: '',
      desc:  'Create a project',
      icon:  HiPlus,
      onClick: () => toaster.create({
        title: 'Add Project',
        description: 'Opening creation form…',
        type: 'success',
        closable: true,
        duration: 5000,
      }),
    },
    {
      label: 'Edit Projects',
      value: projects.filter(p => p.status === 'active').length,
      desc:  'Modify existing',
      icon:  HiPencil,
      onClick: () => toaster.create({
        title: 'Edit Project',
        description: 'Select one to edit.',
        type: 'info',
        closable: true,
        duration: 5000,
      }),
    },
    {
      label: 'Delete Projects',
      value: projects.length,
      desc:  'Remove old ones',
      icon:  HiTrash,
      onClick: () => toaster.create({
        title: 'Delete Project',
        description: 'Choose one to delete.',
        type: 'warning',
        closable: true,
        duration: 5000,
      }),
    },
    {
      label: 'View Analytics',
      value: '',
      desc:  'See detailed charts',
      icon:  HiEye,
      onClick: () => toaster.create({
        title: 'Analytics',
        description: 'Opening analytics view…',
        type: 'info',
        closable: true,
        duration: 5000,
      }),
    },
  ], [projects]);

  // Recent five projects
  const recent = useMemo(() =>
    [...projects]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5),
  [projects]);

  // Quick insights counts
  const { started, finished, total } = useMemo(() => ({
    started:  projects.filter(p => p.status === 'active').length,
    finished: projects.filter(p => p.status === 'completed').length,
    total:    projects.length,
  }), [projects]);

  // loading
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // error
  if (error) {
    return (
      <Alert.Root
        status="error"
        variant="left-accent"
        borderRadius="md"
        mx={{ base: 4, md: 8 }}
        my={6}
      >
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Load Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Content>
        <CloseButton
          position="absolute" top="8px" right="8px"
          onClick={() => setError('')}
        />
      </Alert.Root>
    );
  }

  // main
  return (
    <>
      {/* ensure this is rendered once in your app */}
      <Toaster />

      <Box>
        {/* KPIs */}
        <Box px={{ base: 4, md: 8 }} py={6}>
          <Heading size="lg" mb={1}>Welcome Back!</Heading>
          <Text mb={4} color="gray.400">Here’s what’s happening with your projects</Text>

          <SimpleGrid minChildWidth="240px" spaceX={6} spaceY={6} mb={8}>
            {kpis.map(k => <StatCard key={k.label} {...k} />)}
          </SimpleGrid>
        </Box>

        {/* Recent & Insights */}
        <Box px={{ base: 4, md: 8 }} mb={12}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spaceX={6} spaceY={6}>
            <Box>
              <Heading size="md" mb={4}>Recent Activity</Heading>
              <VStack spacing={4} align="stretch">
                {recent.length > 0
                  ? recent.map(p => (
                      <Card
                        key={p._id}
                        p={4}
                        bg={colorMode==='light'?'gray.100':'whiteAlpha.100'}
                        boxShadow="sm"
                        borderRadius="md"
                      >
                        <Flex justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="medium">{p.title}</Text>
                          <Text
                            fontSize="xs"
                            color={colorMode==='light'?'gray.700':'whiteAlpha.800'}
                          >
                            {new Date(p.date).toLocaleString(undefined,{
                              month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'
                            })}
                          </Text>
                        </Flex>
                        <Text fontSize="xs" color="gray.400">
                          {p.description || 'No details available.'}
                        </Text>
                      </Card>
                    ))
                  : <Text fontSize="sm" color="gray.500">No recent activity.</Text>
                }
              </VStack>
            </Box>
            <Box>
              <Heading size="md" mb={4}>Quick Insights</Heading>
              <Card p={4} bg={colorMode==='light'?'gray.100':'whiteAlpha.100'} boxShadow="sm" borderRadius="md">
                <Stack spacing={3}>
                  <Flex justify="space-between"><Text>Started</Text><Text fontWeight="bold">{started}</Text></Flex>
                  <Flex justify="space-between"><Text>Finished</Text><Text fontWeight="bold">{finished}</Text></Flex>
                  <Flex justify="space-between"><Text>Total</Text><Text fontWeight="bold">{total}</Text></Flex>
                </Stack>
              </Card>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Quick Actions */}
        <Box px={{ base: 4, md: 8 }} py={6}>
          <Heading size="lg" mb={1}>Quick Actions</Heading>
          <SimpleGrid minChildWidth="240px" spaceX={6} spaceY={6} mb={8}>
            {quickActions.map(a => <StatCard key={a.label} {...a} isDisabled={!a.onClick} />)}
          </SimpleGrid>
        </Box>
      </Box>
    </>
  );
}
