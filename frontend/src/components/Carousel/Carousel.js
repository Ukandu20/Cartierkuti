import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CarouselItem from './CarouselItem';
import classes from './Carousel.module.css'; // Import CSS file for carousel styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowRight, faCircleArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [projectData, setProjectData] = useState([]);

  // Fetch project data from the backend API using Axios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/projects');
        setProjectData(response.data);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchData();
  }, []);

  const handleNext = () => {
    const nextIndex = currentIndex === projectData.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = currentIndex === 0 ? projectData.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
  };

  const currentSlide = projectData[currentIndex] || {}; // Handle edge case if data is not available yet

  return (
    <div className={classes.carousel_container}>      
      <div className={classes.carousel_card}>
        <button className={classes.prev_btn} onClick={handlePrev}><FontAwesomeIcon icon={faCircleArrowLeft} /></button>
        <CarouselItem item={currentSlide} />
        <button className={classes.next_btn} onClick={handleNext}><FontAwesomeIcon icon={faCircleArrowRight} /></button>
      </div>
      <div className={classes.carousel_info}>
        <h3><a href={currentSlide.externalLink} target='_blank' rel='noreferrer'>{currentSlide.title}</a></h3>
        <p className={classes.description}>{currentSlide.description}</p>
        <p> ({currentSlide.date})</p>
      </div>
    </div>
  );
}
