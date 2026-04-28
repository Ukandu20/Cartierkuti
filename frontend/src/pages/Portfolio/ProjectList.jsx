// src/pages/Portfolio/ProjectList.jsx
import React from "react";
import { SimpleGrid, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import ProjectCard from "./ProjectCard";

export default function ProjectList({
  searchedProjects,
  favorites,
  handleFavorite,
  hitAndOpen,
  itemVariants,
}) {
  return (
    <SimpleGrid
      as={motion.div}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.12 } },
      }}
      initial="hidden"
      animate="show"
      columns={{ base: 1, md: 2, xl: 3 }}
      gap={{ base: 6, md: 8, xl: 10 }}
      columnGap={{ base: 6, md: 8, xl: 10 }}
      rowGap={{ base: 8, md: 10, xl: 12 }}
    >
      {searchedProjects.map((p) => (
        <Box as={motion.div} key={p.id} variants={itemVariants}>
          <ProjectCard
            project={p}
            favorites={favorites}
            handleFavorite={handleFavorite}
            hitAndOpen={hitAndOpen}
          />
        </Box>
      ))}
    </SimpleGrid>
  );
}
