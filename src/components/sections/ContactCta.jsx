import { forwardRef } from 'react';
import { storeConfig } from '../../config/store';
import './ContactCta.css';

const ContactCta = forwardRef(function ContactCta({ waveColor = 'var(--color-background-soft)' }, ref) {
  return (
    <section className="contact-cta section" ref={ref}>
      <div className="contact-cta__wave" style={{ color: waveColor }}>
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path
            d="M0,120 C120,20 240,220 360,120 C480,20 600,220 720,120 C840,20 960,220 1080,120 C1200,20 1320,220 1440,120 L1440,0 L0,0Z"
            fill="var(--color-background-soft)"
            opacity="0.5"
          />
          <path
            d="M0,100 C120,0 240,200 360,100 C480,0 600,200 720,100 C840,0 960,200 1080,100 C1200,0 1320,200 1440,100 L1440,0 L0,0Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="container">
        <div className="contact-cta__content">
          <h2>¿Tenés alguna consulta?</h2>
          <p>
            Estamos acá para ayudarte. Escribinos por catering, viandas o tu
            pedido online y te asesoramos sin vueltas.
          </p>
          <div className="contact-cta__actions">
            <a
              href={`https://wa.me/${storeConfig.whatsapp}?text=${encodeURIComponent('Hola Estancia Rosso, quiero hacer una consulta.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
              title="Contactanos por WhatsApp"
            >
              WhatsApp
            </a>
            {storeConfig.instagram && (
              <a
                href={storeConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-lg"
                title="Seguinos en Instagram"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

export default ContactCta;
