// src/components/Button/FavoriteButton.jsx
import React from 'react';
import { Button as ChakraButton, useChakraContext } from '@chakra-ui/react';
import { FaHeart } from 'react-icons/fa';
import styles from './FavoriteButton.module.css';

const FavoriteButton = ({ isFavorite, onClick }) => {
  const { colorMode } = useChakraContext();
  // same color in light/dark, but computed here for future flexibility
  const iconColor = '#e74c3c';

  return (
    <ChakraButton
      className={`${styles.favoriteButton} ${isFavorite ? styles.favorite : ''}`}
      onClick={onClick}
      leftIcon={<FaHeart color={isFavorite ? iconColor : 'gray'} />}
      variant="ghost"
    >
      {isFavorite ? 'Favorited' : 'Add to Favorites'}
    </ChakraButton>
  );
};

export default FavoriteButton;
