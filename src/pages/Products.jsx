import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { subscribeToProducts } from '../services/products';
import { getAllCategories } from '../services/categories';
import ProductCard from '../components/products/ProductCard';
import HeroSlider from '../components/ui/HeroSlider';
import Spinner from '../components/ui/Spinner';
import CategoryImage from '../components/ui/CategoryImage';
import {
  findCategoryByTokens,
  parseSearchTokens,
  productBelongsToCategory,
  productMatchesTokens,
} from '../utils/searchProducts';
import './Products.css';

const HERO_SLIDES = [
  {
    id: 'hero-1',
    image: '/images/hero-slider/1.png',
    alt: 'Alimentos saludables de Estancia Rosso',
    title: 'Nuestra elaboración diaria',
    content: {
      tag: 'San Isidro, Buenos Aires',
      title: 'Alimentos saludables, hechos en casa',
      subtitle: 'Viandas, opciones veganas y vegetarianas y congelados.',
      cta: { label: 'Ver productos', to: '/productos' },
    },
  },
  {
    id: 'hero-2',
    image: '/images/hero-slider/2.png',
    alt: 'Catering y viandas de Estancia Rosso',
    title: 'Catering y viandas',
    content: {
      tag: 'A tu gusto',
      title: 'Catering integral y viandas semanales',
      subtitle: 'Elegís cómo querés recibir tu pedido: envío o retiro en local.',
      cta: { label: 'Explorar productos', to: '/productos' },
    },
  },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const contentRef = useRef(null);

  const activeCategory = searchParams.get('categoria') || '';

  const searchTokens = useMemo(() => parseSearchTokens(searchTerm), [searchTerm]);
  const searchedCategory = useMemo(
    () => findCategoryByTokens(categories, searchTokens),
    [categories, searchTokens]
  );
  const urlCategory = useMemo(
    () => categories.find((category) => category.slug === activeCategory) || null,
    [categories, activeCategory]
  );
  const activeCategoryData = searchedCategory || urlCategory;

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToProducts((productsData) => {
      setProducts(productsData.filter((p) => p.activo));
      setLoading(false);
    }, (error) => {
      console.error('Error loading products:', error);
      setLoading(false);
    });
    getAllCategories()
      .then(setCategories)
      .catch((error) => console.error('Error loading categories:', error))
      .finally(() => setLoadingCategories(false));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (activeCategory) {
      contentRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [activeCategory]);

  useEffect(() => {
    let result = [...products];

    if (activeCategoryData) {
      result = result.filter((product) => productBelongsToCategory(product, activeCategoryData));
    }

    if (searchTokens.length > 0) {
      result = result.filter((product) => productMatchesTokens(product, searchTokens));
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.precio - b.precio);
        break;
      case 'price-desc':
        result.sort((a, b) => b.precio - a.precio);
        break;
      case 'name':
        result.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
        break;
      case 'featured':
        result.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
        break;
      default:
        result.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    }

    setFilteredProducts(result);
  }, [products, activeCategoryData, searchTokens, sortBy]);

  const setCategory = (slug) => {
    setSearchTerm('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug) {
        next.set('categoria', slug);
      } else {
        next.delete('categoria');
      }
      return next;
    });
    setFiltersOpen(false);
  };

  const handleCategoryClick = (slug) => {
    setCategory(slug === activeCategory ? null : slug);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('default');
    setCategory(null);
  };

  return (
    <div className="products-page">
      <HeroSlider slides={HERO_SLIDES} ariaLabel="Novedades de la tienda" />

      <div className="products-page__intro sr-only container">
        <h1 className="products-page__title">Nuestros productos</h1>
        <h2 className="products-page__subtitle">Alimentos saludables, viandas, congelados y más</h2>
      </div>

      <div className="products-page__content container" ref={contentRef}>
        <div className="products-page__toolbar">
          <div className="products-page__toolbar-top">
            <div className="products-page__search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                placeholder="Buscar por nombre o categoría..."
                aria-label="Buscar productos por nombre o categoría"
                enterKeyHint="search"
                autoComplete="off"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="products-page__search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="products-page__search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              className="products-page__filter-toggle btn btn-ghost btn-sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="8" y1="12" x2="20" y2="12"/>
                <line x1="12" y1="18" x2="20" y2="18"/>
              </svg>
              Filtros
            </button>
          </div>

          <div className="products-page__toolbar-bottom">
            <select
              className="products-page__sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Ordenar por</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="name">Nombre</option>
              <option value="featured">Destacados</option>
            </select>

            <span className="products-page__count">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
              {activeCategoryData && ` en ${activeCategoryData.nombre}`}
            </span>
          </div>
        </div>

        <div className="products-page__layout">
          <aside className={`products-page__sidebar ${filtersOpen ? 'products-page__sidebar--open' : ''}`}>
            <div className="products-page__sidebar-header">
              <h3 className="products-page__sidebar-title">Categorías</h3>
              <button className="products-page__close-filters" onClick={() => setFiltersOpen(false)}>
                ✕
              </button>
            </div>
            <div className="products-page__categories">
              <button
                className={`products-page__category-btn products-page__category-btn--all ${!activeCategoryData ? 'products-page__category-btn--active' : ''}`}
                onClick={() => setCategory(null)}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`products-page__category-btn ${activeCategoryData?.slug === cat.slug ? 'products-page__category-btn--active' : ''}`}
                  onClick={() => handleCategoryClick(cat.slug)}
                  title={`Categoría ${cat.nombre}`}
                >
                  <span className="products-page__category-avatar">
                    <CategoryImage category={cat} />
                  </span>
                  <span className="products-page__category-name">{cat.nombre}</span>
                </button>
              ))}
            </div>
            {(activeCategory || searchTerm || sortBy !== 'default') && (
              <button className="products-page__clear btn btn-ghost btn-sm" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </aside>

          <div className="products-page__grid">
            {loading || loadingCategories ? (
              <div className="products-page__empty">
                <Spinner />
                <p>Cargando productos...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showDescription={false} />
              ))
            ) : (
              <div className="products-page__empty">
                <p>
                  {searchTokens.length > 0
                    ? `No se encontraron productos para "${searchTerm.trim()}".`
                    : 'No se encontraron productos con los filtros seleccionados.'}
                </p>
                <button className="btn btn-outline" onClick={clearFilters}>
                  Ver todos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
