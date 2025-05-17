// src/components/Button/Button.jsx
import React from 'react'
import { Button as ChakraButton } from '@chakra-ui/react'
import { useColorMode } from '../Theme/color-mode'  // ← your custom hook

const Button = ({ children, onClick, ...props }) => {
  const { colorMode } = useColorMode()

  // you can customize these per mode if you like
  const bg       = 'brand.500'
  const hoverBg  = 'brand.600'
  const fontColor= 'black'

  return (
    <ChakraButton
      bg={bg}
      color={fontColor}
      _hover={{ bg: hoverBg }}
      onClick={onClick}
      borderRadius="md"
      px={6}
      py={3}
      fontWeight="semibold"
      {...props}
    >
      {children}
    </ChakraButton>
  )
}

export default Button
