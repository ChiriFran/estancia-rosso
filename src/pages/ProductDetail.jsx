import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscribeToProductBySlug } from '../services/products';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import FeaturedProducts from '../components/products/FeaturedProducts';
import Spinner from '../components/ui/Spinner';
import './ProductDetail.css';

const SITE_URL = 'https://estancia-rosso.vercel.app';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    setQuantity(1);
    setAdded(false);
    window.scrollTo(0, 0);

    const unsubscribe = subscribeToProductBySlug(slug, (found) => {
      setProduct(found);

    if (found) {
      document.title = `${found.nombre} - Estancia Rosso | San Isidro`;

      const setMeta = (name, content, property = false) => {
        const attr = property ? 'property' : 'name';
        let el = document.querySelector(`meta[${attr}="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      setMeta('description', `${found.nombre} - ${found.descripcion} Compralo en Estancia Rosso, San Isidro, Buenos Aires.`, false);
      setMeta('og:title', `${found.nombre} - Estancia Rosso`, true);
      setMeta('og:description', found.descripcion, true);
      setMeta('og:image', `${SITE_URL}${found.imagen}`, true);
      setMeta('og:url', `${SITE_URL}/producto/${found.slug}`, true);
      setMeta('twitter:title', `${found.nombre} - Estancia Rosso`, false);
      setMeta('twitter:description', found.descripcion, false);
      setMeta('twitter:image', `${SITE_URL}${found.imagen}`, false);

      const existingScript = document.getElementById('product-schema');
      if (existingScript) existingScript.remove();

      const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": found.nombre,
        "description": found.descripcion,
        "image": `${SITE_URL}${found.imagen}`,
        "brand": {
          "@type": "Brand",
          "name": "Estancia Rosso"
        },
        "sku": found.id,
        "category": found.categoria,
        "offers": {
          "@type": "Offer",
          "url": `${SITE_URL}/producto/${found.slug}`,
          "priceCurrency": "ARS",
          "price": found.precio,
          "availability": found.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "Estancia Rosso"
          }
        }
      };

      const script = document.createElement('script');
      script.id = 'product-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }

      setLoading(false);
    }, (error) => {
      console.error('Error loading product:', error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      const script = document.getElementById('product-schema');
      if (script) script.remove();
      document.title = 'Estancia Rosso | San Isidro, Buenos Aires';

      const setMeta = (name, content, property = false) => {
        const attr = property ? 'property' : 'name';
        const el = document.querySelector(`meta[${attr}="${name}"]`);
        if (el) el.setAttribute('content', content);
      };

      setMeta('description', 'Comprá online en Estancia Rosso. Envíos y retiros en San Isidro, Buenos Aires.', false);
      setMeta('og:title', 'Estancia Rosso | San Isidro, Buenos Aires', true);
      setMeta('og:description', 'Comprá online en Estancia Rosso. Envíos y retiros en San Isidro, Buenos Aires.', true);
      setMeta('og:url', SITE_URL, true);
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="product-detail container section">
        <div className="product-detail__not-found">
          <Spinner />
          <p>Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail container section">
        <div className="product-detail__not-found">
          <h2>Producto no encontrado</h2>
          <p>El producto que buscás no existe o fue removido.</p>
          <Link to="/productos" className="btn btn-primary" title="Volver a productos">
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  return (
    <div className="product-detail">
      <div className="container section">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb__link" title="Inicio - Estancia Rosso">Inicio</Link>
          <span className="breadcrumb__separator">/</span>
          <Link to="/productos" className="breadcrumb__link" title="Productos - Estancia Rosso">Productos</Link>
          <span className="breadcrumb__separator">/</span>
          <Link
            to={`/productos?categoria=${product.categoria.toLowerCase().replace(/\s+/g, '-')}`}
            className="breadcrumb__link"
            title={`${product.categoria} - Estancia Rosso`}
          >
            {product.categoria}
          </Link>
          <span className="breadcrumb__separator">/</span>
          <span className="breadcrumb__current">{product.nombre}</span>
        </nav>

        <div className="product-detail__layout">
          {/* Image */}
          <div className="product-detail__image-section">
            <div className="product-detail__image-main">
              <img src={product.imagen} alt={product.nombre} title={`${product.nombre} - Estancia Rosso`} onError={(e) => { const el = e.currentTarget; if (!el.src.includes('/images/placeholder-product.svg')) el.src = '/images/placeholder-product.svg'; }} />
              {product.destacado && (
                <span className="product-detail__badge badge badge-primary">Destacado</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="product-detail__info">
            <span className="product-detail__category">{product.categoria}</span>
            <h1 className="product-detail__name">{product.nombre}</h1>
            <p className="product-detail__description">{product.descripcion}</p>

            <div className="product-detail__pricing">
              <span className="product-detail__price">{formatPrice(product.precio)}</span>
              <span className="product-detail__presentation">{product.presentacion}</span>
            </div>

            {product.precioTransferencia && (
              <div className="product-detail__transfer">
                <span className="product-detail__transfer-label">Precio transferencia:</span>
                <span className="product-detail__transfer-price">{formatPrice(product.precioTransferencia)}</span>
              </div>
            )}

            <div className="product-detail__stock">
              {product.stock > 0 ? (
                <span className="product-detail__stock-available">
                  ✓ Stock disponible ({product.stock} unidades)
                </span>
              ) : (
                <span className="product-detail__stock-unavailable">
                  Sin stock disponible
                </span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="product-detail__add">
                <div className="product-detail__quantity">
                  <button
                    className="product-detail__qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="product-detail__qty-value">{quantity}</span>
                  <button
                    className="product-detail__qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <button
                  className={`btn btn-primary btn-lg product-detail__add-btn ${added ? 'product-detail__add-btn--added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  {added ? '✓ Agregado' : 'Agregar al carrito'}
                </button>
              </div>
            )}

            {/* Ingredients */}
            {product.ingredientes && product.ingredientes.length > 0 && (
              <div className="product-detail__section">
                <h3 className="product-detail__section-title">Ingredientes</h3>
                <ul className="product-detail__ingredients">
                  {product.ingredientes.map((ing, i) => (
                    <li key={i} className="product-detail__ingredient">{ing}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            <div className="product-detail__section">
              <h3 className="product-detail__section-title">Características</h3>
              <ul className="product-detail__features">
                <li>Elaboración propia, ingredientes frescos</li>
                <li>Alimentos congelados para conservar el sabor</li>
                <li>Envío a domicilio o retiro en local</li>
                <li>San Isidro, Buenos Aires</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <FeaturedProducts />
    </div>
  );
};

export default ProductDetail;
