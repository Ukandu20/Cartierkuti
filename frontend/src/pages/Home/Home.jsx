// src/pages/Home/Home.jsx
import React from 'react';
import {
  Box,
  Heading,
  Text,
  Link as ChakraLink,
  useChakraContext,
} from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import {
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiPython,
  SiPandas,
  SiNumpy,
  SiScikitlearn,
  SiTensorflow,
  SiMysql,
} from 'react-icons/si';
import { Link, useLocation } from 'react-router-dom';
import Carousel from '../../components/Carousel/Carousel';
import classes from './Home.module.css';

/* ───────────────────────── helpers ───────────────────────── */
const useActiveLink = (pathname) => {
  const location = useLocation();
  return location.pathname === pathname ? 'active' : '';
};

/* ───────────────────────── sections ──────────────────────── */
const Hero = () => {
  const { colorMode } = useChakraContext();
  const textColor = colorMode === 'light' ? 'gray.200' : 'gray.900';
  const mainHeadingColor = colorMode === 'light' ? 'gray.800' : 'gray.800';
  const subHeadingColor = colorMode === 'light' ? 'gray.600' : 'gray.800';
  const linkColor = colorMode === 'light' ? 'brand.500' : 'brand.500';

  return (
    <Box as="section" className={classes.hero}>
      <Box className={classes.hero_content}>
        <Heading
          as="h1"
          size="2xl"
          mb={2}
          color={mainHeadingColor}
        >
          Hey, I’m Preston
        </Heading>
        <Heading
          as="h2"
          size="md"
          mb={4}
          color={subHeadingColor}
        >
          Full-stack & Data Science Developer
        </Heading>

        <Box className={classes.hero_info}>
          <Text color={textColor} maxW="lg" fontSize="lg">
            Computer Science grad with a passion for building robust web apps
            and extracting insight from data.
          </Text>

          <ChakraLink
            as={Link}
            to="/about"
            className={`${classes.learn_more} ${useActiveLink('/about')}`}
            color={linkColor}
            _hover={{ textDecoration: 'underline' }}
          >
            <span>Learn More</span>
            <FontAwesomeIcon icon={faArrowUp} className={classes.icon} />
          </ChakraLink>
        </Box>
      </Box>
    </Box>
  );
};

const Projects = () => {
  const { colorMode } = useChakraContext();
  const headingColor = colorMode === 'light' ? 'gray.100' : 'gray.800';

  return (
    <Box
      as="section"
      className={classes.projects}
      textAlign="center"
      px={4}
      py={10}
      maxW="6xl"
      mx="auto"
    >
      <Heading
        as="h2"
        size="xl"
        mb={4}
        color={headingColor}
      >
        Featured Projects
      </Heading>
      <Carousel />
    </Box>
  );
};

/* skill arrays */
const webTech = [
  { name: 'JavaScript', Icon: SiJavascript },
  { name: 'React', Icon: SiReact },
  { name: 'Node.js', Icon: SiNodedotjs },
  { name: 'Express', Icon: SiExpress },
  { name: 'MongoDB', Icon: SiMongodb },
];

const dataTech = [
  { name: 'Python', Icon: SiPython },
  { name: 'pandas', Icon: SiPandas },
  { name: 'NumPy', Icon: SiNumpy },
  { name: 'scikit-learn', Icon: SiScikitlearn },
  { name: 'TensorFlow', Icon: SiTensorflow },
  { name: 'SQL', Icon: SiMysql },
];

const SkillGrid = ({ list }) => (
  <ul className={classes.skill_grid}>
    {list.map(({ name, Icon }) => (
      <li key={name} className={classes.skill_card}>
        <Icon className={classes.skill_icon} />
        <span>{name}</span>
      </li>
    ))}
  </ul>
);

const Skills = () => {
  const { colorMode } = useChakraContext();
  const titleColor = colorMode === 'light' ? 'gray.800' : 'gray.800';
  const subtitleColor = colorMode === 'light' ? 'gray.700' : 'gray.800';

  return (
    <Box as="section" id="skills">
      <Heading
        as="h3"
        size="xl"
        textAlign="center"
        mb={6}
        color={titleColor}
      >
        Technical Skills
      </Heading>

      <Heading
        as="h2"
        className={classes.skill_subtitle}
        color={subtitleColor}
      >
        Web Development
      </Heading>
      <SkillGrid list={webTech} />

      <Heading
        as="h2"
        className={classes.skill_subtitle}
        color={subtitleColor}
      >
        Data Science & Analytics
      </Heading>
      <SkillGrid list={dataTech} />
    </Box>
  );
};

const Home = () => (
  <>
    <Hero />
    <Projects />
    <Skills />
  </>
);

export default Home;
