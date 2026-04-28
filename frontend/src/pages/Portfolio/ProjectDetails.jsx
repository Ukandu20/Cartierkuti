// src/components/ProjectDetails/ProjectDetails.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Image,
  Text,
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Icon,
  Textarea,
} from "@chakra-ui/react";
import { FaStar, FaHeart, FaRegStar, FaHeartBroken } from "react-icons/fa";
import { toaster }   from "../../components/ui/toaster";             // ← use your custom toaster
import apiClient from "@/utils/axiosConfig";


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

  const projectId = project?._id ?? project?.id;

  /* palette */
  const palette = useMemo(
    () => ({
      accent      : "brand.500",
      hover       : "brand.600",
      tagBg       : "bg.subtle",
      tagColor    : "fg.default",
      txtMuted    : "fg.muted",
      txtSecondary: "fg.muted",
      txtPrimary  : "fg.default",
      starIdle    : "fg.muted",
      textareaBg  : "bg.subtle",
      textareaCol : "fg.default",
      textareaBd  : "border.subtle",
    }),
    []
  );

  /* fetch reviews */
  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      setLoadingRv(true);
      try {
        const { data } = await apiClient.get(`/api/projects/${projectId}/reviews`);
        setReviews(Array.isArray(data) ? data : []);
      } catch {
        setReviews([]);
      } finally {
        setLoadingRv(false);
      }
    };
    load();
  }, [projectId]);

  /* submit review */
  const submitReview = async () => {
    if (!projectId) return;
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

      await apiClient.post(`/api/projects/${projectId}/reviews`, newReview);

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
      <ButtonGroup size="xs" gap={3} mb={4}>
        <Button
          colorPalette="teal"
          onClick={(e) => openLink(projectId, project.externalLink, e)}
        >
          Live Demo
        </Button>
        <Button
          variant="outline"
          colorPalette="teal"
          onClick={(e) => openLink(projectId, project.githubLink, e)}
        >
          GitHub
        </Button>
      </ButtonGroup>

      {/* tags (headless) */}
      <HStack gap={2} mb={4} wrap="wrap">
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
      <IconButton
        variant="ghost"
        colorPalette="red"
        aria-label={
          isFavorite
            ? isHoveringFav
              ? "Un-favourite project"
              : "Favourite project"
            : "Add to favourites"
        }
        onMouseEnter={() => setIsHoveringFav(true)}
        onMouseLeave={() => setIsHoveringFav(false)}
        onClick={() => handleFavorite(projectId)}
      >
        <Icon
          as={isFavorite && isHoveringFav ? FaHeartBroken : FaHeart}
          boxSize={4}
        />
      </IconButton>

      {/* reviews */}
      <Text fontWeight="bold" mb={2} color={palette.txtPrimary}>
        Reviews
      </Text>
      <Stack gap={3}>
        {loadingRv ? (
          <Text fontSize="sm" color={palette.txtMuted}>
            Loading...
          </Text>
        ) : reviews.length === 0 ? (
          <Text fontSize="sm" color={palette.txtMuted}>
            No reviews yet.
          </Text>
        ) : (
          reviews.map((rv) => (
            <Box key={rv.date}>
              <HStack gap={1} mb={1}>
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

        <ButtonGroup variant="ghost" gap={1} mb={2}>
          {Array.from({ length: 5 }).map((_, i) => (
            <IconButton
              key={i}
              aria-label={`${i + 1} star`}
              variant="ghost"
              onClick={() => setTempStars(i + 1)}
            >
              <Icon
                as={i < tempStars ? FaStar : FaRegStar}
                boxSize={3.5}
                color={i < tempStars ? "yellow.400" : "fg.muted"}
              />
            </IconButton>
          ))}
        </ButtonGroup>

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
          colorPalette="teal"
          size="sm"
          disabled={!tempStars || comment.trim() === ""}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
}
