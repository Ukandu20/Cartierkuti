"use client";

import React from "react";
import {
  Card,
  Image,
  Box,
  Text,
  HStack,
  Stack,
  Icon,
  Button,          // ✅ recipe-driven core Button
  Portal,
  Dialog,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaStar,
  FaHeart,
  FaHeartBroken,  // ← for the favourite toggle
  FaTimes,
} from "react-icons/fa";
import { useColorMode } from "@/components/Theme/color-mode";
import ProjectDetails   from "./ProjectDetails";
import styles           from "./ProjectCard.module.css";

const MotionCard = motion.create(Card.Root);

export default function ProjectCard({
  project,
  favorites,
  handleFavorite,
  hitAndOpen,
}) {
  const { colorMode } = useColorMode();
  const isFav       = favorites.includes(project.id);
  const stripeColor = "brand.500";

  return (
    <Dialog.Root size="lg" placement="center" motionPreset="slide-in-bottom">
      {/* ────────── CARD TRIGGER ────────── */}
      <Dialog.Trigger asChild>
        <MotionCard
          maxW="sm"
          overflow="hidden"
          position="relative"
          className={styles.card}
          cursor="pointer"
        >
          {/* featured ribbon */}
          {project.isFeatured && (
            <Box
              className={styles.stripe}
              bg={stripeColor}
              position="absolute"
              top="0"
              left="0"
            />
          )}

          {/* image */}
          <Image
            src={project.imageUrl}
            alt={project.title}
            w="100%"
            h="180px"
            objectFit="cover"
          />

          {/* title + quick stars */}
          <Box px="3" py="2" bg="blackAlpha.600">
            <Text fontWeight="bold" fontSize="md" color="white">
              {project.title}
            </Text>
            <HStack spacing="0.5" mt="1">
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

          {/* overlay on hover */}
          <Card.Body p="4" className={styles.overlay}>
            <Stack spacing="2">
              <Text fontWeight="bold" fontSize="lg" color="white">
                {project.title}
              </Text>

              {project.avgStars != null && (
                <HStack spacing="0.5">
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
                    ({project.ratings?.length || 0})
                  </Text>
                </HStack>
              )}

              {/* ────────── ACTION BUTTONS ────────── */}
              <Stack direction="row" spacing="2" pt="2">
                <Button
                  size="lg"
                  onClick={(e) =>
                    hitAndOpen(project.id, project.externalLink, e)
                  }
                >
                  Demo
                </Button>

                <Button
                  onClick={(e) =>
                    hitAndOpen(project.id, project.githubLink, e)
                  }
                >
                  GitHub
                </Button>

                {/* recipe-driven favourite toggle */}
                <Button
                  size="icon"
                  variant="favourite"
                  aria-label={
                    isFav ? "Unfavourite project" : "Add to favourites"
                  }
                  onClick={() => handleFavorite(project.id)}
                >
                  <Icon
                    as={isFav ? FaHeartBroken : FaHeart}
                    boxSize={4}
                  />
                </Button>
              </Stack>
            </Stack>
          </Card.Body>
        </MotionCard>
      </Dialog.Trigger>

      {/* ────────── DIALOG ────────── */}
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
            bg={colorMode === "light" ? "white" : "gray.800"}
          >
            <Dialog.Header>
              <Dialog.Title>{project.title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Icon
                  as={FaTimes}
                  aria-label="Close"
                  size={6}
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
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost"></Button>
              </Dialog.CloseTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
