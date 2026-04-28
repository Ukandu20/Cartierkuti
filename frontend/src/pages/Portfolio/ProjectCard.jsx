"use client"

import React from "react"
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CloseButton,
  Dialog,
  HStack,
  Icon,
  IconButton,
  Image,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import {
  FaHeart,
  FaHeartBroken,
  FaStar,
} from "react-icons/fa"
import ProjectDetails from "./ProjectDetails"
import styles from "./ProjectCard.module.css"

const MotionCard = motion.create(Card.Root)

export default function ProjectCard({
  project,
  favorites,
  handleFavorite,
  hitAndOpen,
}) {
  const isFav = favorites.includes(project.id)
  const stripeColor = "brand.500"

  return (
    <Dialog.Root size="lg" placement="center" motionPreset="slide-in-bottom">
      <Dialog.Trigger asChild>
        <MotionCard
          maxW="sm"
          overflow="hidden"
          position="relative"
          className={styles.card}
          cursor="pointer"
        >
          {project.featured && (
            <Box
              className={styles.stripe}
              bg={stripeColor}
              position="absolute"
              top="0"
              left="0"
            />
          )}

          <Image
            src={project.imageUrl}
            alt={project.title}
            w="100%"
            h="180px"
            objectFit="cover"
          />

          <Box px="3" py="2" bg="blackAlpha.600">
            <Text fontWeight="bold" fontSize="md" color="white">
              {project.title}
            </Text>
            <HStack gap="0.5" mt="1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  as={FaStar}
                  key={i}
                  boxSize={4}
                  color={
                    i < Math.round(project.avgStars || 0)
                      ? "yellow.500"
                      : "gray.500"
                  }
                />
              ))}
              <Text fontSize="xs" color="gray.300" ml="1">
                ({project.avgStars?.toFixed(1) || "0"})
              </Text>
            </HStack>
          </Box>

          <Card.Body p="4" className={styles.overlay}>
            <Stack gap="2">
              <Text fontWeight="bold" fontSize="lg" color="white">
                {project.title}
              </Text>

              {project.avgStars != null && (
                <HStack gap="0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon
                      as={FaStar}
                      key={i}
                      boxSize={3.5}
                      color={
                        i < Math.round(project.avgStars)
                          ? "yellow.400"
                          : "gray.600"
                      }
                    />
                  ))}
                  <Text fontSize="xs" color="whiteAlpha.800">
                    ({project.reviews?.length || 0})
                  </Text>
                </HStack>
              )}

              <HStack gap="2" pt="2" align="center">
                <ButtonGroup size="sm" variant="solid" gap="2">
                  <Button
                    h="9"
                    minH="9"
                    onClick={(e) =>
                      hitAndOpen(project.id, project.externalLink, e)
                    }
                  >
                    Demo
                  </Button>

                  <Button
                    h="9"
                    minH="9"
                    onClick={(e) =>
                      hitAndOpen(project.id, project.githubLink, e)
                    }
                  >
                    GitHub
                  </Button>
                </ButtonGroup>

                <IconButton
                  variant="ghost"
                  colorPalette="red"
                  aria-label={
                    isFav ? "Unfavourite project" : "Add to favourites"
                  }
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    handleFavorite(project.id)
                  }}
                >
                  <Icon
                    as={isFav ? FaHeartBroken : FaHeart}
                    boxSize={4}
                  />
                </IconButton>
              </HStack>
            </Stack>
          </Card.Body>
        </MotionCard>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="auto"
          p={4}
        >
          <Dialog.Content
            maxH="calc(100vh - 4rem)"
            overflowY="auto"
            borderRadius={8}
            boxShadow="lg"
            p={4}
            bg="bg.surface"
          >
            <Dialog.Header>
              <Dialog.Title>{project.title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  aria-label="Close"
                  size={6}
                  position="absolute"
                  top="4"
                  right="4"
                />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body p={0}>
              <ProjectDetails
                project={project}
                openLink={hitAndOpen}
                handleFavorite={handleFavorite}
                isFavorite={isFav}
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
