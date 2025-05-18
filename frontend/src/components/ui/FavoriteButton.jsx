// src/components/ui/FavoriteButton.jsx
import { Icon, Button } from "@chakra-ui/react";
import { FaHeart, FaHeartBroken } from "react-icons/fa";

const FavoriteButton = ({ isFavorite, ...rest }) => (
  <Button
    variant="favourite"
    size="icon"
    aria-label={isFavorite ? "Unfavourite" : "Favourite"}
    {...rest}
  >
    <Icon as={isFavorite ? FaHeart : FaHeartBroken} boxSize={4} />
  </Button>
);

export default FavoriteButton;
