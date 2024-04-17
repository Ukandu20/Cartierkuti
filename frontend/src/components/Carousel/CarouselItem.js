import React from 'react';

const CarouselItem = ({ item }) => {
  return (
    <a href={item.externalLink} target="_blank" rel="noopener noreferrer">
      <img src={item.previewImage} alt={item.title} />
    </a>
  );
};

export default CarouselItem;
