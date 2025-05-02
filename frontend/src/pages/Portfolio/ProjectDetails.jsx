// src/components/ProjectDetails/ProjectDetails.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Image,
  Text,
  Button,
  HStack,
  IconButton,
  Stack,
  Tag,
  Icon,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useColorMode } from "../../components/Theme/color-mode";

export default function ProjectDetails({
  project,
  openLink,
  handleFavorite,
  isFavorite,
}) {
  const [reviews, setReviews] = useState([]);
  const [tempStars, setTempStars] = useState(0);
  const [comment, setComment] = useState("");
  const { colorMode } = useColorMode();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/projects/${project.id}/reviews`);
        setReviews(await res.json());
      } catch {
        setReviews([]);
      }
    };
    if (project?.id) fetchReviews();
  }, [project.id]);

  const submitReview = async () => {
    try {
      await fetch(`/api/projects/${project.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: tempStars, comment }),
      });
      setTempStars(0);
      setComment("");
      window.alert("Thanks for the review!");
      // re-fetch
      const res = await fetch(`/api/projects/${project.id}/reviews`);
      setReviews(await res.json());
    } catch {
      window.alert("Could not save review. Please try again.");
    }
  };

  const accent        = "brand.500";
  const hover         = "brand.600";
  const tagBg         = colorMode === "light" ? "gray.100" : "gray.700";
  const tagColor      = colorMode === "light" ? "black"    : "white";
  const textareaBg    = colorMode === "light" ? "white"    : "gray.700";
  const textareaColor = colorMode === "light" ? "black"    : "white";
  const textareaBorder= colorMode === "light" ? "gray.300" : "gray.600";

  return (
    <Box p={6}>
      <Image
        src={project.imageUrl}
        alt={project.title}
        borderRadius="md"
        objectFit="cover"
        w="100%"
        h="200px"
        mb={4}
      />

      <Text mb={3} fontSize="md" color={colorMode === "light" ? "gray.600" : "gray.400"}>
        {project.description}
      </Text>

      <HStack spacing={4} mb={4}>
        <Button
          bg={accent}
          color="black"
          _hover={{ bg: hover }}
          onClick={e => openLink(project.externalLink, e)}
        >
          Live Demo
        </Button>
        <Button
          variant="outline"
          borderColor={accent}
          color={accent}
          _hover={{ bg: hover, color: "black" }}
          onClick={e => openLink(project.githubLink, e)}
        >
          GitHub
        </Button>
      </HStack>

      <HStack spacing={2} mb={4} wrap="wrap">
        {project.tags.map(tag => (
          <Tag key={tag} bg={tagBg} color={tagColor} px={3} py={1} borderRadius="full">
            {tag}
          </Tag>
        ))}
      </HStack>

      <Button
        size="sm"
        colorScheme={isFavorite ? "red" : "gray"}
        variant={isFavorite ? "solid" : "outline"}
        onClick={() => handleFavorite(project.id)}
        mb={6}
      >
        {isFavorite ? "Unfavorite" : "Add to Favorites"}
      </Button>

      <Text fontWeight="bold" mb={2} color={colorMode === "light" ? "gray.800" : "gray.100"}>
        Reviews
      </Text>
      <Stack spacing={3}>
        {reviews.length === 0 ? (
          <Text fontSize="sm" color={colorMode === "light" ? "gray.400" : "gray.500"}>
            No reviews yet.
          </Text>
        ) : reviews.map((rv, i) => (
          <Box key={i}>
            <HStack spacing={1} mb={1}>
              {Array.from({ length: 5 }).map((_, j) => (
                <Icon
                  key={j}
                  as={FontAwesomeIcon}
                  icon={faStar}
                  boxSize="14px"
                  color={j < rv.stars ? "yellow.400" : "gray.600"}
                />
              ))}
              <Text fontSize="xs" color={colorMode === "light" ? "gray.400" : "gray.500"}>
                {new Date(rv.date).toLocaleDateString()}
              </Text>
            </HStack>
            <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.200"}>
              {rv.comment}
            </Text>
          </Box>
        ))}
      </Stack>

      <Box mt={6}>
        <Text fontWeight="bold" mb={2} color={colorMode === "light" ? "gray.800" : "gray.100"}>
          Leave a Review
        </Text>
        <HStack mb={2}>
          {Array.from({ length: 5 }).map((_, i) => (
            <IconButton
              key={i}
              icon={<FontAwesomeIcon icon={faStar} />}
              variant={i < tempStars ? "solid" : "ghost"}
              colorScheme="yellow"
              size="sm"
              onClick={() => setTempStars(i + 1)}
              aria-label={`${i + 1} star`}
            />
          ))}
        </HStack>
        <Box
          as="textarea"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="What did you think?"
          bg={textareaBg}
          color={textareaColor}
          border="1px solid"
          borderColor={textareaBorder}
          mb={3}
          p={2}
          borderRadius="md"
          w="100%"
          minH="80px"
        />
        <Button onClick={submitReview} colorScheme="brand" bg={accent} color="black" _hover={{ bg: hover }} isDisabled={!tempStars}>
          Submit
        </Button>
      </Box>
    </Box>
  );
}
