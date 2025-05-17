// src/components/Button/FavoriteButton.jsx
import React from 'react'
import { Button as ChakraButton } from '@chakra-ui/react'
import { useColorMode } from '../Theme/color-mode'  // ← your custom hook
import { FaHeart } from 'react-icons/fa'
import styles from './FavoriteButton.module.css'

const FavoriteButton = ({ isFavorite, onClick }) => {
  const { colorMode } = useColorMode()
  const iconColor = '#e74c3c'

  return (
    <ChakraButton
      className={`${styles.favoriteButton} ${isFavorite ? styles.favorite : ''}`}
      onClick={onClick}
      leftIcon={<FaHeart color={isFavorite ? iconColor : 'gray'} />}
      variant="ghost"
    />
  )
}

export default FavoriteButton
