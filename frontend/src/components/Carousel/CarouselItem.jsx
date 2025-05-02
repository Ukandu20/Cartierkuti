import React from 'react';
import classes from './CarouselItem.module.css';

const CarouselItem = ({ item }) => {
  if (!item) return null;

  return (
    <div className={classes.fadeIn}>
      <a
        href={item.externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className={classes.carouselItem}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          className={classes.image}
          loading="lazy"
        />
      </a>
    </div>
  );
};

export default CarouselItem;
