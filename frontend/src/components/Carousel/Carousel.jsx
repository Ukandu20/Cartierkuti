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
  Pagination,
  Autoplay,
  A11y,
  Keyboard,
} from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// ⬇️  react-query for caching / retries
import axios from 'axios'



import { useColorMode as useThemeColorMode } from '@/components/Theme/color-mode'

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
    axios.get('/api/projects')
        .then(r => setProjects(r.data))
        .catch(console.error)
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

  const textClr = colorMode === 'light' ? 'gray.900' : 'white'
  const cardBg  = colorMode === 'light' ? 'whiteAlpha.50' : 'blackAlpha.400'

  

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
      px={{ base: 4, md: 8 }}
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
      />
      <CarouselNavButton
        ref={nextRef}
        icon={FaArrowRight}
        pos="right"
        labelFn={(idx) =>
          `Next project (${idx + 2 > total ? 1 : idx + 2} of ${total})`
        }
      />

      {/* Swiper */}
      <SlideIndexContext.Provider value={activeIdx}>
      <Swiper
        modules={[Navigation, Pagination, A11y, Keyboard, ...(prefersReducedMotion ? [] : [Autoplay])]}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(sw) => {
          sw.params.navigation.prevEl = prevRef.current
          sw.params.navigation.nextEl = nextRef.current
        }}
        onSwiper={(sw) => (swiperRef.current = sw)}
        onSlideChange={(sw) => {
          liveRef.current.textContent = projects[sw.realIndex].title
          setActiveIdx(sw.realIndex)
          
        }}
        autoplay={
          prefersReducedMotion
            ? false
            : { delay: 6500, disableOnInteraction: false }
        }
        pagination={{
          clickable: true,
          bulletClass: 'chakra-carousel-bullet',
          renderBullet: (_, className) =>
            `<span class="${className}" aria-hidden="true"></span>`,
        }}
        keyboard={{ enabled: true }}
        centeredSlides
        loop
        style={{ height: '480px' }}
      >
        {projects.map((p, i) => (
          <SwiperSlide key={p.id}>
            <SlideCard
              project={p}
              textClr={textClr}
              cardBg={cardBg}
              eager={i === 0}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </SlideIndexContext.Provider>
      {/* bullets style */}
      <Global
        styles={`
          .chakra-carousel-bullet{
            width:8px;height:8px;margin:6px;border-radius:50%;
            background:var(--chakra-colors-gray-400);cursor:pointer;
            aspect-ratio:1/1;
          }
          .chakra-carousel-bullet.swiper-pagination-bullet-active{
            background:var(--chakra-colors-brand-500);
          }
          
          @media(min-width:48em){
            .swiper-pagination{
              /* left-column bullets on desktop */
              position:absolute!important;left:40px!important;
              top:50%!important;transform:translateY(-50%)!important;
              display:flex!important;flex-direction:column;
            }
          }
        `}
      />

      {/* anchor after skip link */}
      <span id="after-carousel" />
    </Box>
  )
}

/* ------------------------------------------------- */
/*  Sub-components                                  */
/* ------------------------------------------------- */
const CarouselNavButton = React.forwardRef(({ icon, pos, labelFn }, ref) => {
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
      display={{ base: 'none', sm: 'inline-flex' }}
    >
      <Icon as={icon} boxSize={8} />
    </Button>
  )
})

/* share current index with nav buttons */
const SlideIndexContext = React.createContext(0)

function SlideCard({ project, textClr, cardBg, eager }) {
  return (
    <Flex
      h="full"
      px={{ base: 4, lg: 24 }}
      direction={{ base: 'column', md: 'row' }}
      align="center"
      justify="center"
      gap={{ base: 6, md: 12 }}
    >
      <Stack
        flex="1"
        maxW="lg"
        bg={cardBg}
        p={{ base: 6, md: 8 }}
        rounded="xl"
        boxShadow="lg"
        color={textClr}
        textAlign={{ base: 'center', md: 'left' }}
      >
        <Heading fontSize={{ base: '3xl', md: '4xl' }}>{project.title}</Heading>
        <Text>{project.description}</Text>
        <HStack pt={3} justify={{ base: 'center', md: 'flex-start' }}>
          <Button
            as={ChakraLink}
            href={project.externalLink}
            isExternal
            colorScheme="brand"
            px={2}
          >
            Live Demo
          </Button>
          <Button
            as={ChakraLink}
            href={project.githubLink}
            isExternal
            variant="outline"
            colorScheme="brand"
            px={2}
          >
            GitHub
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
          transition="transform .6s cubic-bezier(.25,.46,.45,.94)"
          _hover={!usePrefersReducedMotion() && { transform: 'scale(1.05)' }}
        />
      </Box>
    </Flex>
  )
}
