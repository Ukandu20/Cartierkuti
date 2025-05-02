// src/components/Carousel/Carousel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import classes from './Carousel.module.css';

const Carousel = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get('/api/projects');
        setProjects(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    getData();
  }, []);

  if (!projects.length) return null;

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      centeredSlides
      loop
      autoplay={{ delay: 6500, disableOnInteraction: false }}
      pagination={{ clickable: true, el: '.vertical-dots', bulletClass: classes.dot }}
      className={classes.swiper}
    >
      {projects.map((p) => (
        <SwiperSlide key={p.id}>
          <div className={classes.slide}>
            {/* ── left (copy) ─────────────────────────────── */}
            <div className={classes.copy}>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className={classes.btnRow}>
                <a href={p.externalLink} target="_blank" rel="noreferrer">
                  Live Demo
                </a>
                <a href={p.githubLink} target="_blank" rel="noreferrer" className={classes.secondary}>
                  GitHub
                </a>
              </div>
            </div>

            {/* ── right (image) ─────────────────────────── */}
            <div className={classes.imageWrap}>
              <img src={p.imageUrl} alt={p.title} loading="lazy" />
            </div>
          </div>
        </SwiperSlide>
      ))}

      {/* vertical pagination bullets */}
      <div className={`vertical-dots ${classes.dots}`}></div>
    </Swiper>
  );
};

export default Carousel;
