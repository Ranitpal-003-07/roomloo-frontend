import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/styles.css";

const featuredPGs = [
  { id: 2, image: "/assets/plc2.jpg", title: "Affordable PG in Delhi" },
  { id: 3, image: "/assets/plc3.jpg", title: "Cozy PG in Mumbai" },
  { id: 1, image: "/assets/plc1.jpg", title: "Luxury PG in Bangalore" },
  { id: 4, image: "/assets/plc2.jpg", title: "Premium PG in Hyderabad" },
];

const FeaturedPGSlider = () => {
  return (
    <div className="slider-container">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        loop={true}
        slidesPerView={1}
      >
        {featuredPGs.map((pg) => (
          <SwiperSlide key={pg.id}>
            <div className="pg-slide">
              <img src={pg.image} alt={pg.title} />
              <div className="pg-title">{pg.title}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeaturedPGSlider;
