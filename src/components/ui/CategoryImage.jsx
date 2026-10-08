import { useState } from 'react';

const FALLBACK = '/images/placeholder-product.svg';

const getCandidates = (orig) => {
  if (!orig) return [FALLBACK];
  const ext = orig.split('.').pop()?.toLowerCase();
  const base = orig.replace(/\.[^.]+$/, '');
  const candidates = [];
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
    candidates.push(`${base}.webp`);
  }
  candidates.push(orig);
  return candidates;
};

const CategoryImage = ({ category, className, title }) => {
  const original = category?.imagen;
  const [candidates] = useState(() => getCandidates(original));
  const [index, setIndex] = useState(0);
  const src = candidates[index] || FALLBACK;

  const handleError = () => {
    if (index + 1 < candidates.length) {
      setIndex(index + 1);
      return;
    }
    if (src !== FALLBACK) {
      setIndex(candidates.length);
    }
  };

  return (
    <img
      src={src}
      alt={category?.nombre || ''}
      title={title}
      className={className}
      decoding="async"
      onError={handleError}
    />
  );
};

export default CategoryImage;
