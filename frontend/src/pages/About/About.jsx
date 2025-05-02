// src/pages/About/About.jsx
import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Stack,
  useChakraContext,
} from "@chakra-ui/react";

export default function About() {
  const [activeTab, setActiveTab] = useState("Education");
  const { colorMode } = useChakraContext();

  // Theme-safe color values computed manually
  const textColor = colorMode === "light" ? "gray.600" : "gray.300";
  const headingColor = colorMode === "light" ? "gray.800" : "gray.100";
  const borderColor = colorMode === "light" ? "gray.200" : "gray.600";
  const tabInactiveColor = colorMode === "light" ? "gray.700" : "gray.200";
  const tabActiveTextColor = colorMode === "light" ? "black" : "white";

  const tabs = [
    { id: "Education", label: "Education" },
    { id: "Skills", label: "Skills" },
    { id: "Experience", label: "Experience" },
  ];

  const educationTimelineItems = [
    {
      title: "University of Windsor, Windsor, Ontario",
      degree: "Bachelor of Computer Science",
      duration: "2018 - 2023",
    },
    {
      title: "Columbia International College, Hamilton, Ontario.",
      degree: "12th Grade",
      duration: "2017-2018",
    },
    {
      title: "Trinity International College, Lagos State, Nigeria.",
      degree: "High school",
      duration: "2014-2017",
    },
    {
      title: "Corona Secondary School, Ogun State, Nigeria.",
      degree: "High School",
      duration: "2010-2014",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Education":
        return (
          <VStack align="start" spacing={6} mt={6}>
            {educationTimelineItems.map((item, index) => (
              <Box
                key={index}
                borderBottom="1px solid"
                borderColor={borderColor}
                pb={4}
              >
                <Heading as="h3" size="sm" color={headingColor}>
                  {item.title}
                </Heading>
                <Text color={textColor}>{item.degree}</Text>
                <Text fontSize="sm" color={textColor}>
                  {item.duration}
                </Text>
              </Box>
            ))}
          </VStack>
        );

      case "Skills":
        return (
          <Box mt={6}>
            <Text fontWeight="bold" mb={2} color={textColor}>
              Languages & Tools:
            </Text>
            <Stack spacing={2} color={textColor}>
              <Text>- JavaScript, React, Node.js</Text>
              <Text>- Express, MongoDB, Python</Text>
              <Text>- Git & GitHub, SQL</Text>
            </Stack>
          </Box>
        );

      case "Experience":
        return (
          <Box mt={6}>
            <Text fontWeight="bold" mb={2} color={textColor}>
              Roles:
            </Text>
            <Stack spacing={3} color={textColor}>
              <Box>
                <Text fontWeight="semibold">Volunteer Python Instructor</Text>
                <Text fontSize="sm" color={textColor}>
                  Black Boys Code, 2023–Present
                </Text>
              </Box>
              <Box>
                <Text fontWeight="semibold">Freelance Developer</Text>
                <Text fontSize="sm" color={textColor}>
                  2022–Present
                </Text>
              </Box>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <Heading mb={2} color={headingColor}>
        About Me
      </Heading>
      <Text fontSize="lg" mb={6} color={textColor}>
        I’m a passionate fullstack developer with interests in data science, AI,
        and creating modern web experiences. I thrive at the intersection of
        creativity and logic.
      </Text>

      <HStack spacing={4} mb={4} wrap="wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "solid" : "outline"}
            colorScheme="brand"
            color={
              activeTab === tab.id ? tabActiveTextColor : tabInactiveColor
            }
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </HStack>

      {renderTabContent()}
    </Box>
  );
}
