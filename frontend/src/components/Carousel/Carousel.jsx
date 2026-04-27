// 'use client'
import React, { useRef } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Link as ChakraLink,
  Skeleton,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react'
import { Global } from '@emotion/react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import {
  Navigation,
  Autoplay,
  A11y,
  Keyboard,
} from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// ⬇️  react-query for caching / retries
import apiClient from '@/utils/axiosConfig'
import { normalizeProjects } from '@/utils/projectNormalizer'




import { useColorMode as useThemeColorMode } from '@/components/Theme/color-mode'

const editorialFonts = {
  heading: "'Playfair Display', serif",
  body: "'Source Sans 3', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
}

const getEditorialTokens = (colorMode) => ({
  bg: colorMode === 'light' ? '#F6F4F1' : '#141414',
  surface: colorMode === 'light' ? '#FFFFFF' : '#1B1B1B',
  surfaceAlt: colorMode === 'light' ? '#FBFAF8' : '#222222',
  ink: colorMode === 'light' ? '#1A1A1A' : 'gray.100',
  muted: colorMode === 'light' ? '#4B4B4B' : 'gray.400',
  rule: colorMode === 'light' ? '#E2DED8' : 'gray.700',
  accentData: '#0F766E',
  accentSecurity: '#7C2D12',
})

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefers(media.matches)
    update()
    media.addEventListener ? media.addEventListener('change', update)
                           : media.addListener(update)
    return () =>
      media.removeEventListener
        ? media.removeEventListener('change', update)
        : media.removeListener(update)
  }, [])

  return prefers
}


export default function Carousel() {
  const [projects, setProjects] = React.useState(null)
  const [isLoading, setLoading] = React.useState(true)
  const [activeIdx, setActiveIdx] = React.useState(0)

  React.useEffect(() => {
    apiClient.get('/api/projects')
        .then(r => setProjects(normalizeProjects(r.data)))
        .catch((err) => {
          if (import.meta.env.DEV) console.error(err)
          setProjects([])
        })
        .finally(() => setLoading(false))
  }, [])

  const { colorMode }         = useThemeColorMode()
  const prefersReducedMotion  = usePrefersReducedMotion()


  const swiperRef = useRef(null)
  const prevRef   = useRef(null)
  const nextRef   = useRef(null)
  const liveRef   = useRef(null)

  /* ------------------------------------------------- */
  /*  Loading skeleton                                */
  /* ------------------------------------------------- */
  if (isLoading || !projects) {
    return (
      <HStack justify="center" gap={6} minH="480px">
        <Skeleton h="320px" w="300px" borderRadius="xl" />
        <Skeleton h="320px" w="300px" borderRadius="xl" />
      </HStack>
    )
  }
  if (!projects.length) return null

  /* helpers */
  const pause   = () => swiperRef.current?.autoplay?.stop()
  const resume  = () => swiperRef.current?.autoplay?.start()
  const total   = projects.length
  const maxBullets = 7
  const safeMax = Math.min(maxBullets, total)
  const half = Math.floor(safeMax / 2)
  const clampedStart = Math.max(0, Math.min(activeIdx - half, total - safeMax))
  const visibleBullets = Array.from({ length: safeMax }, (_, i) => clampedStart + i)

  const tokens = getEditorialTokens(colorMode)

  

  /* ------------------------------------------------- */
  /*  JSX                                             */
  /* ------------------------------------------------- */
  return (
    <Box
      role="region"
      aria-label="Project carousel"
      position="relative"
      maxW="7xl"
      mx="auto"
      my={8}
      px={{ base: 4, md: 12 }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
    >
      {/* Skip link */}
      <ChakraLink
        href="#after-carousel"
        position="absolute"
        left="-9999px"
        _focus={{
          left: 2,
          top: 2,
          bg: 'brand.500',
          color: 'white',
          p: 2,
          rounded: 'md',
          zIndex: 'tooltip',
        }}
      >
        Skip carousel
      </ChakraLink>

      {/* Live region for SR */}
      <VisuallyHidden ref={liveRef} aria-live="polite" />

      {/* Prev / Next */}
      <CarouselNavButton
        ref={prevRef}
        icon={FaArrowLeft}
        pos="left"
        labelFn={(idx) => `Previous project (${idx === 0 ? total : idx} of ${total})`}
        color={tokens.ink}
        hidden
      />
      <CarouselNavButton
        ref={nextRef}
        icon={FaArrowRight}
        pos="right"
        labelFn={(idx) =>
          `Next project (${idx + 2 > total ? 1 : idx + 2} of ${total})`
        }
        color={tokens.ink}
        hidden
      />

      {/* Swiper */}
      <SlideIndexContext.Provider value={activeIdx}>
        <Box maxW="6xl" mx="auto">
          <Swiper
            modules={[Navigation, A11y, Keyboard, ...(prefersReducedMotion ? [] : [Autoplay])]}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onBeforeInit={(sw) => {
              sw.params.navigation.prevEl = prevRef.current
              sw.params.navigation.nextEl = nextRef.current
            }}
            onSwiper={(sw) => (swiperRef.current = sw)}
            onSlideChange={(sw) => {
              if (liveRef.current) {
                liveRef.current.textContent = projects[sw.realIndex].title
              }
              setActiveIdx(sw.realIndex)
            }}
            autoplay={
              prefersReducedMotion
                ? false
                : { delay: 6500, disableOnInteraction: false }
            }
            keyboard={{ enabled: true }}
            centeredSlides
            loop
            style={{ height: '520px' }}
          >
            {projects.map((p, i) => (
              <SwiperSlide key={p.id}>
                <SlideCard
                  project={p}
                  tokens={tokens}
                  eager={i === 0}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </SlideIndexContext.Provider>

      <Stack
        position="absolute"
        left={0}
        top="50%"
        transform="translateY(-50%)"
        spacing={2}
        align="center"
        display={{ base: 'none', md: 'flex' }}
      >
        {visibleBullets.map((idx) => {
          const isActive = idx === activeIdx
          return (
            <Box
              key={`bullet-${idx}`}
              as="button"
              type="button"
              aria-label={`Go to project ${idx + 1}`}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => swiperRef.current?.slideToLoop(idx)}
              w="8px"
              h="8px"
              borderRadius="full"
              bg={isActive ? tokens.accentData : tokens.rule}
              transition="transform 0.2s ease"
              _hover={{ transform: 'scale(1.2)' }}
            />
          )
        })}
      </Stack>
      {/* bullets style */}
      <Global styles="" />

      {/* anchor after skip link */}
      <span id="after-carousel" />
    </Box>
  )
}

/* ------------------------------------------------- */
/*  Sub-components                                  */
/* ------------------------------------------------- */
const CarouselNavButton = React.forwardRef(({ icon, pos, labelFn, color, hidden = false }, ref) => {
  const idx = React.useContext(SlideIndexContext)
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="lg"
      position="absolute"
      { ...(pos === 'left' ? { left: 2 } : { right: 2 }) }
      top="50%"
      transform="translateY(-50%)"
      zIndex={2}
      aria-label={labelFn(idx)}
      _focusVisible={{ boxShadow: 'outline' }}
      display={hidden ? 'none' : { base: 'none', sm: 'inline-flex' }}
      color={color}
    >
      <Icon as={icon} boxSize={8} />
    </Button>
  )
})

/* share current index with nav buttons */
const SlideIndexContext = React.createContext(0)

function SlideCard({ project, tokens, eager }) {
  const tags = Array.isArray(project.tags) && project.tags.length
    ? project.tags.slice(0, 3)
    : Array.isArray(project.languages) && project.languages.length
      ? project.languages.slice(0, 3)
      : []

  return (
    <Flex
      h="full"
      px={{ base: 4, lg: 10 }}
      direction={{ base: 'column', md: 'row' }}
      align="center"
      justify="center"
      gap={{ base: 6, md: 12 }}
    >
      <Stack
        flex="1"
        maxW="lg"
        bg={tokens.surface}
        p={{ base: 6, md: 8 }}
        rounded="2xl"
        border="1px solid"
        borderColor={tokens.rule}
        boxShadow="sm"
        color={tokens.ink}
        textAlign={{ base: 'center', md: 'left' }}
      >
        <Stack spacing={2}>
          <Text
            fontFamily={editorialFonts.mono}
            fontSize="xs"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color={tokens.muted}
          >
            {project.category || 'Featured project'}
          </Text>
          <Heading fontFamily={editorialFonts.heading} fontSize={{ base: '3xl', md: '4xl' }}>
            {project.title}
          </Heading>
        </Stack>
        <Text fontFamily={editorialFonts.body} color={tokens.muted}>
          {project.description}
        </Text>

        {tags.length ? (
          <HStack spacing={2} flexWrap="wrap">
            {tags.map((tag) => (
              <Box
                key={tag}
                px={2}
                py={1}
                border="1px solid"
                borderColor={tokens.rule}
                borderRadius="full"
                fontFamily={editorialFonts.mono}
                fontSize="xs"
                color={tokens.muted}
              >
                {tag}
              </Box>
            ))}
          </HStack>
        ) : null}

        <HStack pt={3} justify={{ base: 'center', md: 'flex-start' }}>
          <Button
            asChild
            colorPalette="teal"
            size="md"
            fontFamily={editorialFonts.body}
          >
            <ChakraLink href={project.externalLink} isExternal>
              Live Demo
            </ChakraLink>
          </Button>
          <Button
            asChild
            variant="outline"
            colorPalette="teal"
            size="md"
            fontFamily={editorialFonts.body}
          >
            <ChakraLink href={project.githubLink} isExternal>
              GitHub
            </ChakraLink>
          </Button>
        </HStack>
      </Stack>

      <Box flex="1" maxW={{ base: '100%', md: '50%' }} align="center">
        <Image
          src={project.imageUrl}
          srcSet={`${project.imageUrlSmall} 480w, ${project.imageUrl} 960w`}
          sizes="(min-width: 48em) 50vw, 100vw"
          alt={project.title}
          loading={eager ? 'eager' : 'lazy'}
          fallbackSrc="/placeholder.svg"
          w={{ base: '100%', md: '400px' }}
          h={{ base: 'auto',  md: '400px' }}
          objectFit="contain"
          bg={tokens.surfaceAlt}
          border="1px solid"
          borderColor={tokens.rule}
          borderRadius="2xl"
          p={{ base: 3, md: 6 }}
          transition="transform .6s cubic-bezier(.25,.46,.45,.94)"
          _hover={!usePrefersReducedMotion() && { transform: 'scale(1.03)' }}
        />
      </Box>
    </Flex>
  )
}
