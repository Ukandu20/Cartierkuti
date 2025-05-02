import { Button } from '@chakra-ui/react';

const LinkButton = ({ children, onClick, ...props }) => (
  <Button
    bg="brand.500"
    color="black"
    _hover={{ bg: 'brand.600' }}
    borderRadius="md"
    px={6}
    py={3}
    fontWeight="semibold"
    onClick={onClick}
    {...props}
  >
    {children}
  </Button>
);

export default LinkButton;
