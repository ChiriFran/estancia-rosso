import { Link } from 'react-router-dom';
import { storeConfig } from '../../config/store';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,52 C360,112 720,12 1080,72 C1260,92 1380,52 1440,52 L1440,0 L0,0 Z" fill="var(--color-primary-light)" opacity="0.5"/>
          <path d="M0,40 C360,100 720,0 1080,60 C1260,80 1380,40 1440,40 L1440,0 L0,0 Z" fill="currentColor"/>
        </svg>
      </div>
      <div className="footer__content container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo" title="Estancia Rosso - Inicio">
              <span className="footer__logo-estancia">Estancia</span>
              <span className="footer__logo-rosso">Rosso</span>
            </Link>
            <p className="footer__description">
              Elaboración de alimentos saludables, viandas, opciones veganas y
              vegetarianas y servicio integral de catering. Envíos en San Isidro y alrededores.
            </p>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Productos</h4>
            <Link to="/productos" className="footer__link" title="Ver todos los productos">
              Todos los productos
            </Link>
            <Link to="/productos?categoria=destacados" className="footer__link" title="Destacados">
              Destacados
            </Link>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Empresa</h4>
            <Link to="/nosotros" className="footer__link" title="Conocé nuestra historia">Nosotros</Link>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Contacto</h4>
            <a href={`https://wa.me/${storeConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="footer__link" title="Contactanos por WhatsApp">
              WhatsApp
            </a>
            {storeConfig.instagram && (
              <a href={storeConfig.instagram} target="_blank" rel="noopener noreferrer" className="footer__link" title="Seguinos en Instagram">
                Instagram
              </a>
            )}
            {storeConfig.email && (
              <a href={`mailto:${storeConfig.email}`} className="footer__link" title="Envianos un email">
                {storeConfig.email}
              </a>
            )}
            <span className="footer__link footer__link--address">{storeConfig.address}</span>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} {storeConfig.name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
