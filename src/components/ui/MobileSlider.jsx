import { useState, useEffect, useRef } from 'react';
import './MobileSlider.css';

const resolvePerView = (value, isDesktop) => {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const resolved = isDesktop ? value.desktop : value.mobile;
    return typeof resolved === 'number' ? resolved : 1;
  }
  return 1;
};

const MobileSlider = ({ children, gridClass = '', perView: perViewProp = 1 }) => {
  const [current, setCurrent] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handleChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const perView = Math.max(1, resolvePerView(perViewProp, isDesktop));
  const items = Array.isArray(children) ? children : [children];
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perView));
  const page = Math.min(current, pages - 1);

  const pointerStart = useRef(null);
  const dragged = useRef(false);

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture no disponible */
    }
    pointerStart.current = e.clientX;
    dragged.current = false;
  };

  const handlePointerMove = (e) => {
    if (pointerStart.current === null) return;
    if (Math.abs(e.clientX - pointerStart.current) > 10) {
      dragged.current = true;
    }
  };

  const handlePointerUp = (e) => {
    if (pointerStart.current === null) return;
    const distance = e.clientX - pointerStart.current;
    const minSwipe = 50;

    if (distance < -minSwipe) {
      setCurrent(Math.min(page + 1, pages - 1));
    } else if (distance > minSwipe) {
      setCurrent(Math.max(page - 1, 0));
    }

    pointerStart.current = null;
  };

  const handlePointerCancel = () => {
    pointerStart.current = null;
    dragged.current = false;
  };

  const handleClickCapture = (e) => {
    if (dragged.current) {
      e.preventDefault();
      e.stopPropagation();
      dragged.current = false;
    }
  };

  const startItem = Math.min(page * perView, Math.max(0, total - perView));
  const offset = (startItem * 100) / perView;

  return (
    <div className="mobile-slider">
      <div
        className={`mobile-slider__track ${gridClass}`}
        style={{
          '--mobile-slider-per-view': String(perView),
          transform: `translateX(-${offset}%)`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
      >
        {items.map((child, i) => (
          <div className="mobile-slider__slide" key={i}>
            {child}
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="mobile-slider__dots">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              className={`mobile-slider__dot ${i === page ? 'mobile-slider__dot--active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileSlider;
