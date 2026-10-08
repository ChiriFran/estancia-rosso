import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToProducts } from '../services/products';
import { getAllCategories } from '../services/categories';
import FeaturedProducts from '../components/products/FeaturedProducts';
import MobileSlider from '../components/ui/MobileSlider';
import ContactCta from '../components/sections/ContactCta';
import Spinner from '../components/ui/Spinner';
import CategoryImage from '../components/ui/CategoryImage';
import './Home.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(() => {
      setLoading(false);
    }, (error) => {
      console.error('Error loading products:', error);
      setLoading(false);
    });
    getAllCategories().then(setCategories);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section--visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addSectionRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__container container">
          <div className="hero__content">
            <span className="hero__tag">San Isidro - Buenos Aires</span>
            <h1 className="hero__title">
              Comida saludable, <span className="hero__title-highlight">hecha en Estancia Rosso</span>
            </h1>
            <p className="hero__subtitle">
              Elaboramos alimentos saludables: viandas, opciones veganas y vegetarianas
              y alimentos congelados. Además, servicio integral de catering.
              Envíos a domicilio y retiro en local en San Isidro.
            </p>
          </div>
          <div className="hero__visual">
            <div className="hero__image-wrapper">
              <div className="hero__blob"></div>
              <img
                src="images/logo.png"
                alt="Estancia Rosso"
                title="Estancia Rosso - San Isidro, Buenos Aires"
                className="hero__image"
                decoding="async"
                onError={(e) => { if (e.target.src !== '/favicon.svg') e.target.src = '/favicon.svg'; }}
              />
            </div>
          </div>
          <div className="hero__cta">
            <Link to="/productos" className="btn btn-primary btn-lg" title="Ver todos nuestros productos">
              Ver productos
            </Link>
            <Link to="/nosotros" className="btn btn-outline btn-lg" title="Conocé nuestra historia">
              Conocenos
            </Link>
          </div>
        </div>
        <div className="hero__decoration">
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none">
            <path d="M0,80 C120,180 240,-20 360,80 C480,180 600,-20 720,80 C840,180 960,-20 1080,80 C1200,180 1320,-20 1440,80 L1440,200 L0,200Z" fill="var(--color-primary-light)" opacity="0.5"/>
            <path d="M0,100 C120,200 240,0 360,100 C480,200 600,0 720,100 C840,200 960,0 1080,100 C1200,200 1320,0 1440,100 L1440,200 L0,200Z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* Categories */}
      <section className="categories section" ref={addSectionRef}>
        <div className="container">
          <h2 className="section-title">Explorá nuestras categorías</h2>
          <p className="section-subtitle">Viandas, alimentos congelados, opciones veganas y vegetarianas y más.</p>
          {loading ? (
            <Spinner />
          ) : (
            <MobileSlider gridClass="categories-row" perView={{ mobile: 3, desktop: 6 }}>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/productos?categoria=${cat.slug}`}
                  className="category-circle"
                >
                  <div className="category-circle__image">
                    <CategoryImage category={cat} title={`Categoría ${cat.nombre} - Estancia Rosso`} />
                  </div>
                  <span className="category-circle__name">{cat.nombre}</span>
                </Link>
              ))}
            </MobileSlider>
          )}
        </div>
      </section>

      {/* Wraps */}
      <FeaturedProducts
        category="Wraps"
        title="Envolvé tu día en sabor"
        subtitle="Wraps frescos y prácticos, elaborados con ingredientes de verdad para comer rico donde vayas."
        ctaLabel="Ver todos los wraps"
        ctaTo="/productos?categoria=wraps"
      />

      {/* Benefits */}
      <section className="benefits section" ref={addSectionRef}>
        <div className="container">
          <h2 className="section-title">¿Qué ofrecemos?</h2>
          <MobileSlider gridClass="benefits-grid" perView={{ mobile: 1, desktop: 3 }}>
            <div className="benefit">
              <div className="benefit__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
              </div>
              <h3 className="benefit__title">Alimentos saludables</h3>
              <p className="benefit__text">Elaboración propia con ingredientes frescos, para comer rico y bien todos los días.</p>
            </div>
            <div className="benefit">
              <div className="benefit__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3 className="benefit__title">El mejor precio y calidad</h3>
              <p className="benefit__text">La mejor relación calidad-precio, sin gastar un peso de más.</p>
            </div>
            <div className="benefit">
              <div className="benefit__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M4.22 6.5l15.56 9M19.78 6.5L4.22 15.5"/>
                </svg>
              </div>
              <h3 className="benefit__title">Alimentos congelados</h3>
              <p className="benefit__text">Conservados en frío para que lleguen a tu mesa con todo su sabor.</p>
            </div>
            <div className="benefit">
              <div className="benefit__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 18h16"/>
                  <path d="M6 18a6 6 0 0 1 12 0"/>
                  <path d="M12 9V7"/>
                  <path d="M3 21h18"/>
                </svg>
              </div>
              <h3 className="benefit__title">Servicio integral de catering</h3>
              <p className="benefit__text">Menús a medida para tus eventos, reuniones y celebraciones.</p>
            </div>
            <div className="benefit">
              <div className="benefit__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="7" width="18" height="13" rx="2"/>
                  <path d="M3 12h18"/>
                  <path d="M9 7V5a3 3 0 0 1 3-3 3 3 0 0 1 3 3v2"/>
                </svg>
              </div>
              <h3 className="benefit__title">Viandas</h3>
              <p className="benefit__text">Viandas saludables y prácticas para la oficina o para casa.</p>
            </div>
            <div className="benefit">
              <div className="benefit__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 21v-7"/>
                  <path d="M12 14c-5 0-8-3-8-8 5 0 8 3 8 8z"/>
                  <path d="M12 14c0-4 2-7 6-8"/>
                </svg>
              </div>
              <h3 className="benefit__title">Vegano y vegetariano</h3>
              <p className="benefit__text">Opciones 100% vegetales en gran parte de nuestra elaboración.</p>
            </div>
          </MobileSlider>
        </div>
      </section>

      {/* Editorial 1 */}
      <section className="editorial editorial--snack editorial--snack--alt section" ref={addSectionRef}>
        <div className="container">
          <div className="editorial__grid editorial__grid--reverse">
            <div className="editorial__visual">
              <div className="editorial__glow" aria-hidden="true"></div>
              <div className="editorial__frame">
                <img
                  src="/images/hero-slider/1.png"
                  alt="Estancia Rosso"
                  title="Alimentos saludables elaborados en Estancia Rosso"
                  className="editorial__img"
                />
                <span className="editorial__badge">
                  <span className="editorial__list-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  Comida de verdad
                </span>
              </div>
              <span className="editorial__chip editorial__chip--top" aria-hidden="true">El mejor precio</span>
              <span className="editorial__chip editorial__chip--bottom" aria-hidden="true">Hecho en casa</span>
            </div>
            <div className="editorial__content">
              <span className="editorial__tag">¿Quiénes somos?</span>
              <h2 className="editorial__title">Elaboración de alimentos saludables</h2>
              <p className="editorial__text">
                En Estancia Rosso elaboramos nuestra propia comida: recetas pensadas para comer rico
                y bien todos los días. Preparamos viandas, opciones veganas y vegetarianas y
                alimentos congelados, con ingredientes frescos y a un precio justo.
              </p>
              <ul className="editorial__list">
                <li className="editorial__list-item">
                  <span className="editorial__list-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  Elaboración propia, todos los días
                </li>
                <li className="editorial__list-item">
                  <span className="editorial__list-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  Opciones veganas y vegetarianas
                </li>
                <li className="editorial__list-item">
                  <span className="editorial__list-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  El mejor precio y calidad en cada pedido
                </li>
              </ul>
              <Link to="/nosotros" className="btn btn-outline" title="Conocé nuestra historia">
                Conocé más
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Editorial 2 */}
      <section className="editorial editorial--snack section" ref={addSectionRef}>
        <div className="container">
          <div className="editorial__grid">
            <div className="editorial__content">
              <span className="editorial__tag">Catering y viandas</span>
              <h2 className="editorial__title">Servicio integral de catering</h2>
              <p className="editorial__text">
                Armamos el menú de tu evento, reunión o celebración y nos ocupamos de todo:
                elaboración, presentación y entrega. También preparamos viandas saludables
                para la semana, con opciones veganas y vegetarianas.
              </p>
              <ul className="editorial__list">
                <li className="editorial__list-item">
                  <span className="editorial__list-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  Menús a medida para cada evento
                </li>
                <li className="editorial__list-item">
                  <span className="editorial__list-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  Viandas saludables para el día a día
                </li>
                <li className="editorial__list-item">
                  <span className="editorial__list-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  Atención personalizada y sin vueltas
                </li>
              </ul>
              <Link to="/productos" className="btn btn-outline" title="Explorar catálogo de productos">
                Explorar productos
              </Link>
            </div>
            <div className="editorial__visual">
              <div className="editorial__glow" aria-hidden="true"></div>
              <div className="editorial__frame">
                <img
                  className="editorial__img"
                  src="/images/hero-slider/2.png"
                  alt="Catering Estancia Rosso"
                  title="Servicio integral de catering y viandas"
                />
                <span className="editorial__badge">
                  <span className="editorial__badge-dot" aria-hidden="true"></span>
                  Hecho con dedicación
                </span>
              </div>
              <span className="editorial__chip editorial__chip--top" aria-hidden="true">A medida</span>
              <span className="editorial__chip editorial__chip--bottom" aria-hidden="true">Viandas semanales</span>
            </div>
          </div>
        </div>
      </section>

      <ContactCta ref={addSectionRef} waveColor="var(--color-background)" />

      {/* Testimonials */}
      <section className="testimonials section" ref={addSectionRef}>
        <div className="container">
          <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          <p className="section-subtitle">Testimonios de quienes ya probaron nuestras viandas y catering.</p>
          <MobileSlider gridClass="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__text">
                "Las viandas están riquísimas y muy bien presentadas. Repetimos todas las semanas."
              </p>
              <span className="testimonial-card__author">— María G.</span>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__text">
                "Contratamos el catering para una reunión y todos quedaron encantados."
              </p>
              <span className="testimonial-card__author">— Carlos R.</span>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-card__stars">★★★★★</div>
              <p className="testimonial-card__text">
                "Compro para mi familia: todo llega fresco, a tiempo y a muy buen precio."
              </p>
              <span className="testimonial-card__author">— Laura M.</span>
            </div>
          </MobileSlider>
        </div>
      </section>
    </div>
  );
};

export default Home;
