// src/components/ProjectDetails/ProjectDetails.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Image,
  Text,
  Button,
  HStack,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Icon,
  Textarea,
} from "@chakra-ui/react";
import { FaStar, FaHeart, FaRegStar, FaHeartBroken } from "react-icons/fa";
import { useColorMode } from "../../components/Theme/color-mode";
import { toaster }   from "../../components/ui/toaster";             // ← use your custom toaster


export default function ProjectDetails({
  project,
  openLink,
  handleFavorite,
  isFavorite,
}) {
  /* state */
  const [reviews,   setReviews]   = useState([]);
  const [tempStars, setTempStars] = useState(0);
  const [comment,   setComment]   = useState("");
  const [loadingRv, setLoadingRv] = useState(false);
  const [isHoveringFav, setIsHoveringFav] = useState(false);

  const { colorMode } = useColorMode();

  /* palette */
  const palette = useMemo(
    () => ({
      accent      : "brand.500",
      hover       : "brand.600",
      tagBg       : colorMode === "light" ? "gray.100" : "gray.700",
      tagColor    : colorMode === "light" ? "black"    : "white",
      txtMuted    : colorMode === "light" ? "gray.400" : "gray.500",
      txtSecondary: colorMode === "light" ? "gray.600" : "gray.400",
      txtPrimary  : colorMode === "light" ? "gray.800" : "gray.100",
      starIdle    : colorMode === "light" ? "gray.300" : "gray.600",
      textareaBg  : colorMode === "light" ? "white"    : "gray.700",
      textareaCol : colorMode === "light" ? "black"    : "white",
      textareaBd  : colorMode === "light" ? "gray.300" : "gray.600",
    }),
    [colorMode]
  );

  /* fetch reviews */
  useEffect(() => {
    if (!project?.id) return;
    const load = async () => {
      setLoadingRv(true);
      try {
        const res = await fetch(`/api/projects/${project.id}/reviews`);
        if (!res.ok) throw new Error();
        setReviews(await res.json());
      } catch {
        setReviews([]);
      } finally {
        setLoadingRv(false);
      }
    };
    load();
  }, [project?.id]);

  /* submit review */
  const submitReview = async () => {
    try {
      const newReview = {
        stars: tempStars,
        comment,
        date: new Date().toISOString(),
      };

      // Optimistic UI
      setReviews((r) => [newReview, ...r]);
      setTempStars(0);
      setComment("");

      await fetch(`/api/projects/${project.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      toaster({
        description: "Thanks for the review!",
        status: "success",
      });
    } catch {
      toaster({
        description: "Could not save review.",
        status: "error",
      });
    }
  };

  return (
    <Box p={6}>
      {/* hero image */}
      <Image
        src={project.imageUrl}
        alt={project.title}
        w="100%"
        h="200px"
        objectFit="cover"
        rounded="md"
        mb={4}
        loading="lazy"
      />

      {/* description */}
      <Text mb={3} fontSize="md" color={palette.txtSecondary}>
        {project.description}
      </Text>

      {/* links */}
      <HStack spacing={4} mb={4}>
        <Button
          bg={palette.accent}
          color="black"
          _hover={{ bg: palette.hover }}
          px={2}
          py={1}
          onClick={(e) => openLink(project.externalLink, e)}
        >
          Live Demo
        </Button>
        <Button
          variant="outline"
          borderColor={palette.accent}
          color={palette.accent}
          _hover={{ bg: palette.hover, color: "black" }}
          px={2}
          py={1}
          onClick={(e) => openLink(project.githubLink, e)}
        >
          GitHub
        </Button>
      </HStack>

      {/* tags (headless) */}
      <HStack spacing={2} mb={4} wrap="wrap">
        {project.tags.map((tag) => (
          <Tag.Root
            key={tag}
            bg={palette.tagBg}
            color={palette.tagColor}
            rounded="full"
            px={3}
            py={1}
          >
            <TagLabel>{tag}</TagLabel>
          </Tag.Root>
        ))}
      </HStack>

      {/* favorite */}
      <Icon
        /* show 💔 only while hovering a saved favourite */
        as={isFavorite && isHoveringFav ? FaHeartBroken : FaHeart}
        boxSize={4}
        role="button"
        aria-label={
          isFavorite
            ? isHoveringFav
              ? "Un-favourite project"
              : "Favourite project"
            : "Add to favourites"
        }
        cursor="pointer"
        color={isFavorite ? "red.500" : palette.txtMuted}
        _hover={{ color: "red.500" }}
        onMouseEnter={() => setIsHoveringFav(true)}
        onMouseLeave={() => setIsHoveringFav(false)}
        onClick={() => handleFavorite(project.id)}
        transition="color 0.15s ease"
      />

      {/* reviews */}
      <Text fontWeight="bold" mb={2} color={palette.txtPrimary}>
        Reviews
      </Text>
      <Stack spacing={3}>
        {loadingRv ? (
          <Text fontSize="sm" color={palette.txtMuted}>
            Loading…
          </Text>
        ) : reviews.length === 0 ? (
          <Text fontSize="sm" color={palette.txtMuted}>
            No reviews yet.
          </Text>
        ) : (
          reviews.map((rv) => (
            <Box key={rv.date}>
              <HStack spacing={1} mb={1}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Icon
                    key={j}
                    as={FaStar}
                    boxSize={4}
                    color={j < rv.stars ? "yellow.400" : palette.starIdle}
                  />
                ))}
                <Text fontSize="xs" color={palette.txtMuted}>
                  {new Date(rv.date).toLocaleDateString()}
                </Text>
              </HStack>
              <Text fontSize="sm" color={palette.txtPrimary}>
                {rv.comment}
              </Text>
            </Box>
          ))
        )}
      </Stack>

      {/* leave review */}
      <Box mt={6}>
        <Text fontWeight="bold" mb={2} color={palette.txtPrimary}>
          Leave a Review
        </Text>

        <HStack mb={2}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              as={FaStar}
              boxSize={3.5}
              key={i}
              aria-label={`${i + 1} star`}
              variant="ghost"
              icon={i < tempStars ? <FaStar /> : <FaRegStar />}   // ← outline when idle
              color={i < tempStars ? "yellow.400" : "gray.500"}   // ← darker idle color
              onClick={() => setTempStars(i + 1)}
            />
          ))}
        </HStack>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think?"
          bg={palette.textareaBg}
          color={palette.textareaCol}
          borderColor={palette.textareaBd}
          mb={3}
          minH="80px"
        />

        <Button
          onClick={submitReview}
          bg={palette.accent}
          color="black"
          px={4}
          _hover={{ bg: palette.hover }}
          isDisabled={!tempStars || comment.trim() === ""}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
}
