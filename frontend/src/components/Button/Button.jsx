// src/components/Button/Button.jsx
import React from 'react';
import { Button as ChakraButton, useChakraContext } from '@chakra-ui/react';

const Button = ({ children, onClick, ...props }) => {
  const { colorMode } = useChakraContext();

  // Compute light vs dark values manually
  const bg = colorMode === 'light' ? 'brand.500' : 'brand.500';
  const hoverBg = colorMode === 'light' ? 'brand.600' : 'brand.600';
  const color = colorMode === 'light' ? 'black' : 'black';

  return (
    <ChakraButton
      bg={bg}
      color={color}
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
  );
};

export default Button;
