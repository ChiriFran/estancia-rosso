import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './HeroSlider.css';

const HeroSlider = ({ slides = [], interval = 6000, ariaLabel = 'Destacados' }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const touchStartX = useRef(null);
  const total = slides.length;

  const goTo = useCallback(
    (index) => {
      if (total === 0) return;
      setCurrent((index + total) % total);
      setProgressKey((k) => k + 1);
    },
    [total]
  );

  const active = total === 0 ? 0 : current % total;

  const next = useCallback(() => goTo(active + 1), [goTo, active]);
  const prev = useCallback(() => goTo(active - 1), [goTo, active]);

  useEffect(() => {
    if (total < 2 || isPaused) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    const timer = setTimeout(next, interval);
    return () => clearTimeout(timer);
  }, [active, total, isPaused, interval, next, progressKey]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [next, prev]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const distance = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;

    if (Math.abs(distance) < 50) return;
    if (distance > 0) next();
    else prev();
  };

  if (total === 0) return null;

  return (
    <section
      className="hero-slider"
      aria-roledescription="carrusel"
      aria-label={ariaLabel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-slider__track">
        {slides.map((slide, i) => (
          <figure
            key={slide.id ?? i}
            className={`hero-slider__slide ${i === active ? 'hero-slider__slide--active' : ''}`}
            aria-hidden={i !== active}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              title={slide.title || slide.alt}
              className="hero-slider__img"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </figure>
        ))}
      </div>

      <div className="hero-slider__overlay" />

      {slides[active].content && (
        <div className="hero-slider__content container" key={`content-${active}-${progressKey}`}>
          {slides[active].content.tag && <span className="hero-slider__tag">{slides[active].content.tag}</span>}
          {slides[active].content.title && <h2 className="hero-slider__title">{slides[active].content.title}</h2>}
          {slides[active].content.subtitle && <p className="hero-slider__subtitle">{slides[active].content.subtitle}</p>}
          {slides[active].content.cta && (
            <div className="hero-slider__cta">
              <Link to={slides[active].content.cta.to} className="btn btn-primary btn-lg">
                {slides[active].content.cta.label}
              </Link>
            </div>
          )}
        </div>
      )}

      {total > 1 && (
        <>
          <button
            type="button"
            className="hero-slider__arrow hero-slider__arrow--prev"
            onClick={prev}
            aria-label="Imagen anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="hero-slider__arrow hero-slider__arrow--next"
            onClick={next}
            aria-label="Imagen siguiente"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="hero-slider__dots">
            {slides.map((slide, i) => (
              <button
                key={slide.id ?? i}
                type="button"
                className={`hero-slider__dot ${i === active ? 'hero-slider__dot--active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Ir a la imagen ${i + 1}`}
                aria-current={i === active}
              >
                {i === active && total > 1 && !isPaused && (
                  <span key={progressKey} className="hero-slider__dot-progress" style={{ animationDuration: `${interval}ms` }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
