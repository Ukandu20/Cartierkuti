import React from 'react'
import { SimpleGrid } from '@chakra-ui/react'
import ProjectCard from './ProjectCard'

export default function ProjectList({
  searchedProjects,
  favorites,
  handleFavorite,
  hitAndOpen,
}) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={{ base: 6, md: 8 }} alignItems="stretch">
      {searchedProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          favorites={favorites}
          handleFavorite={handleFavorite}
          hitAndOpen={hitAndOpen}
        />
      ))}
    </SimpleGrid>
  )
}
