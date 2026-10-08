import { normalizeText } from './normalizeText';

const flatten = (value) => normalizeText(value).replace(/[-_/.]+/g, ' ').trim();

const uniqueStrings = (values) => [...new Set(values.filter(Boolean))];

export const parseSearchTokens = (raw) => flatten(raw).split(' ').filter(Boolean);

const productHaystack = (product) =>
  uniqueStrings([
    product.nombre,
    product.descripcionCorta,
    product.descripcion,
    product.presentacion,
    product.categoria,
    product.slug,
    ...(Array.isArray(product.ingredientes) ? product.ingredientes : [product.ingredientes]),
  ].map(flatten));

const categoryHaystack = (category) =>
  uniqueStrings([category.nombre, category.slug, category.descripcion].map(flatten));

const matchesTokens = (haystack, tokens) =>
  tokens.every((token) => haystack.some((field) => field.includes(token)));

export const productMatchesTokens = (product, tokens) =>
  tokens.length === 0 || matchesTokens(productHaystack(product), tokens);

export const findCategoryByTokens = (categories, tokens) => {
  if (tokens.length === 0) return null;
  return categories.find((category) => matchesTokens(categoryHaystack(category), tokens)) || null;
};

export const productBelongsToCategory = (product, category) => {
  if (!category) return true;
  const productCategory = flatten(product.categoria);
  if (!productCategory) return false;
  return flatten(category.slug) === productCategory || flatten(category.nombre) === productCategory;
};
