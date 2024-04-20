import React from 'react';
import classes from './CarouselItem.module.css'; // Import CSS styles for the component

const CarouselItem = ({ item }) => {
  return (
    <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className={classes.carouselItem}>
      <img src={`${item.imageUrl}`} alt={item.title} className={classes.image} />
    </a>
  );
};

export default CarouselItem;
