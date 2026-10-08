import { useEffect, useRef } from "react";
import ContactCta from "../components/sections/ContactCta";
import "./About.css";

const About = () => {
  const imageBgRef = useRef(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            imageObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6, rootMargin: "0px 0px -20% 0px" },
    );

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    const sections = sectionsRef.current.filter(Boolean);
    const frameId = requestAnimationFrame(() => {
      sections.forEach((section) => {
        sectionObserver.observe(section);

        const { top, bottom } = section.getBoundingClientRect();
        if (top < window.innerHeight && bottom > 0) {
          section.classList.add("is-visible");
        }
      });

      if (imageBgRef.current) {
        imageObserver.observe(imageBgRef.current);
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
      imageObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const addSectionRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <div className="about">
      <section className="about__hero section" ref={addSectionRef} aria-hidden="true" />

      <section className="about__content section" ref={addSectionRef}>
        <div className="container">
          <div className="about__grid">
            <div className="about__text">
              <h1 className="about__section-title">Nuestra forma de hacerlo</h1>
              <p>
                Elaboramos alimentos saludables todos los días: viandas, opciones
                veganas y vegetarianas y alimentos congelados que conservan su
                sabor. Cocinamos pensando en comer rico y bien, sin vueltas.
              </p>
              <p>
                Además ofrecemos un servicio integral de catering para eventos,
                reuniones y celebraciones, con menús a medida y el mejor precio y
                calidad del rubro.
              </p>
            </div>
            <div className="about__image">
              <div className="about__image-bg" ref={imageBgRef}>
                <div className="about__image-placeholder" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about__values section" ref={addSectionRef}>
        <div className="container">
          <h2 className="section-title">Nuestros valores</h2>
          <div className="about__values-grid">
            <div className="about__value">
              <div className="about__value-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Saludable</h3>
              <p>
                Elaboración propia con ingredientes frescos, pensada para el día a día.
              </p>
            </div>
            <div className="about__value">
              <div className="about__value-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>Calidad</h3>
              <p>Elaboramos en pequeños lotes para cuidar el sabor y la presentación.</p>
            </div>
            <div className="about__value">
              <div className="about__value-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3>Catering</h3>
              <p>
                Nos ocupamos de todo: menú, elaboración y entrega de tu evento.
              </p>
            </div>
            <div className="about__value">
              <div className="about__value-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <h3>Pasión</h3>
              <p>Amamos lo que hacemos y se nota en cada detalle.</p>
            </div>
          </div>
        </div>
      </section>

      <ContactCta ref={addSectionRef} />
    </div>
  );
};

export default About;
