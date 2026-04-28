// src/components/ui/FavoriteButton.jsx
import { Icon, IconButton } from "@chakra-ui/react";
import { FaHeart, FaHeartBroken } from "react-icons/fa";

const FavoriteButton = ({ isFavorite, ...rest }) => (
  <IconButton
    variant="ghost"
    colorPalette="red"
    aria-label={isFavorite ? "Unfavourite" : "Favourite"}
    {...rest}
  >
    <Icon as={isFavorite ? FaHeart : FaHeartBroken} boxSize={4} />
  </Button>
);

export default FavoriteButton;
