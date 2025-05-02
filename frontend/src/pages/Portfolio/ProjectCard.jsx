// src/components/ProjectCard/ProjectCard.jsx
import React from "react";
import {
  Card,
  Image,
  Box,
  Text,
  HStack,
  Stack,
  Icon,
  IconButton,
  Button,
  Portal,
  Dialog,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaStar, FaTimes } from "react-icons/fa";
import { useColorMode } from "../../components/Theme/color-mode";
import LinkButton from "@/components/Button/LinkButton";
import FavoriteButton from "@/components/Button/FavoriteButton";
import ProjectDetails from "./ProjectDetails";
import styles from "./ProjectCard.module.css";

const MotionCard = motion.create(Card.Root);

export default function ProjectCard({
  project,
  favorites,
  handleFavorite,
  hitAndOpen,
}) {
  const { colorMode } = useColorMode();
  const isFav = favorites.includes(project.id);
  const stripeColor = "brand.500";

  return (
    <Dialog.Root size="xl" placement="center" motionPreset="slide-in-bottom">
      <Dialog.Trigger asChild>
        <MotionCard
          maxW="sm"
          overflow="hidden"
          position="relative"
          className={styles.card}
          cursor="pointer"
        >
          {project.isFeatured && (
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
            <HStack spacing="0.5" mt="1">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar
                  as={Icon}
                  key={i}
                  boxSize="12px"
                  color={
                    i < Math.round(project.avgStars || 0)
                      ? "yellow.400"
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
            <Stack spacing="2">
              <Text fontWeight="bold" fontSize="lg" color="white">
                {project.title}
              </Text>
              {project.avgStars != null && (
                <HStack spacing="0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                      as={Icon}
                      key={i}
                      boxSize="14px"
                      color={
                        i < Math.round(project.avgStars)
                          ? "yellow.400"
                          : "gray.600"
                      }
                    />
                  ))}
                  <Text fontSize="xs" color="whiteAlpha.800">
                    ({project.ratings?.length || 0})
                  </Text>
                </HStack>
              )}
              <Stack direction="row" spacing="2" pt="2">
                <LinkButton
                  size="sm"
                  onClick={(e) =>
                    hitAndOpen(project.id, project.externalLink, e)
                  }
                >
                  Demo
                </LinkButton>
                <LinkButton
                  size="sm"
                  variant="outline"
                  onClick={(e) =>
                    hitAndOpen(project.id, project.githubLink, e)
                  }
                >
                  GitHub
                </LinkButton>
              </Stack>
            </Stack>
          </Card.Body>

          <Card.Footer justify="flex-end" p="3" gap="2">
            <FavoriteButton
              isFavorite={isFav}
              onClick={() => handleFavorite(project.id)}
            />
          </Card.Footer>
        </MotionCard>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{project.title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <IconButton
                  icon={<FaTimes size={16} />}
                  aria-label="Close"
                  size="sm"
                  variant="ghost"
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
            <Dialog.Footer>
              <Button variant="ghost">Close</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
