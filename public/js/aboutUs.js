var swiper = new Swiper(".mySwiper", {
  slidesPerView: 1 /* Show one testimonial at a time */,
  spaceBetween: 20 /* Gap between slides */,
  loop: true /* Infinite looping */,
  autoplay: {
    delay: 3000 /* Auto-slide every 3 seconds */,
    disableOnInteraction: false,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    768: { slidesPerView: 2 } /* 2 testimonials on tablets */,
    1024: { slidesPerView: 3 } /* 3 testimonials on laptops */,
  },
});
