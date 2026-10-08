import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToProducts } from '../../services/products';
import ProductCard from './ProductCard';
import Spinner from '../ui/Spinner';
import './FeaturedProducts.css';

const FeaturedProducts = ({ limit = 4 }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((products) => {
      setFeaturedProducts(products.filter((product) => product.destacado && product.activo).slice(0, limit));
      setLoading(false);
    }, (error) => {
      console.error('Error loading featured products:', error);
      setLoading(false);
    });
    return unsubscribe;
  }, [limit]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section--visible');
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="featured section section--animate" ref={sectionRef}>
      <div className="featured__wave">
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path
            d="M0,120 C120,20 240,220 360,120 C480,20 600,220 720,120 C840,20 960,220 1080,120 C1200,20 1320,220 1440,120 L1440,0 L0,0Z"
            fill="var(--color-secondary)"
            opacity="0.4"
          />
          <path
            d="M0,100 C120,0 240,200 360,100 C480,0 600,200 720,100 C840,0 960,200 1080,100 C1200,0 1320,200 1440,100 L1440,0 L0,0Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="container">
        <h2 className="section-title">Los más elegidos</h2>
        <p className="section-subtitle">Descubrí los productos favoritos de nuestros clientes en San Isidro.</p>
        {loading ? (
          <Spinner />
        ) : (
          <div className="featured__grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="featured__cta">
          <Link to="/productos" className="btn btn-primary" title="Ver todos los productos">
            Ver todos los productos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
