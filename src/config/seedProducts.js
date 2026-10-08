import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';
import { slugify } from '../utils/slugify.js';
import { getAdminDb } from '../../scripts/firebaseAdmin.js';

const EXCEL_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/productos.xlsx');
const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';
const STOCK_INICIAL = 10;

const CATEGORIAS = [
  'Hamburguesas Veggie',
  'Milanesas Veggie',
  'Wraps',
  'Tartas',
  'Canastitas',
  'Empanadas',
  'Novedades',
];

const DESTACADOS = new Set([
  'Hamburguesa veggie de lentejas',
  'Wrap de vegetales',
  'Tarta de calabaza',
  'Empanada de carne',
]);

const flat = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const cellValue = (rows, row, col) => rows[row]?.[col] ?? '';

const toNumber = (raw) =>
  /^\d{1,3}(?:\.\d{3})+$/.test(raw) ? Number(raw.replace(/\./g, '')) : Number(raw);

const firstPrice = (text) => {
  const match = String(text).match(/\$\s*([0-9][0-9.]*)/);
  return match ? toNumber(match[1]) : null;
};

const packOf = (text) => {
  const match = String(text).match(/\(\s*(Pack[^)]*?)\s*\)/i);
  return match ? flat(match[1]) : null;
};

const descsOf = (text) => {
  const descriptions = [];
  const pattern = /\(([^)]*)\)?/g;
  let match;
  while ((match = pattern.exec(String(text))) !== null) {
    const desc = flat(match[1]);
    if (desc && !/^pack/i.test(desc)) descriptions.push(desc);
  }
  return descriptions;
};

const cleanDesc = (text) => {
  const value = flat(text).replace(/\s+,/g, ',');
  if (!value) return '';
  const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
};

const shorten = (text, max = 90) =>
  text.length <= max ? text : `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;

const splitIngredients = (text) =>
  text
    .replace(/\.$/, '')
    .split(/\s*,\s*|\s+y\s+/i)
    .map(flat)
    .filter(Boolean);

const makeProduct = ({ nombre, descripcion, categoria, precio, presentacion }) => {
  const texto = cleanDesc(descripcion);
  return {
    nombre,
    slug: slugify(nombre),
    descripcion: texto,
    descripcionCorta: shorten(texto),
    categoria,
    precio,
    precioTransferencia: precio,
    presentacion: presentacion || '1 u',
    ingredientes: splitIngredients(texto),
    stock: STOCK_INICIAL,
    destacado: DESTACADOS.has(nombre),
    activo: true,
    imagen: PLACEHOLDER_IMAGE,
  };
};

const parseBlock = (text) => {
  const entries = [];
  let current = null;
  let pending = [];

  const close = () => {
    if (!current) return;
    entries.push({ ...current, lines: [...current.lines, ...pending] });
    current = null;
    pending = [];
  };

  for (const rawLine of String(text).split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const priceMatch = line.match(/^(.*?)(?:[\s.]*\$\s*([0-9][0-9.]*))\s*$/);
    if (priceMatch) {
      close();
      const name = flat(priceMatch[1]);
      if (name && !/^\(?\s*pack/i.test(name)) {
        current = { nombre: name, precio: toNumber(priceMatch[2]), lines: [] };
      }
      continue;
    }
    if (current) pending.push(line);
  }
  close();

  return entries.map((entry) => {
    const descriptions = descsOf(entry.lines.join(' '));
    if (descriptions.length === 0) {
      throw new Error(`Sin descripción para "${entry.nombre}" en el Excel.`);
    }
    return { nombre: entry.nombre, precio: entry.precio, descripcion: descriptions.join(', ') };
  });
};

const buildCatalog = () => {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const grid = (sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Falta la hoja "${sheetName}" en ${path.basename(EXCEL_PATH)}.`);
    return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false });
  };

  const t1 = grid('Table 1');
  const t2 = grid('Table 2');
  const catalog = [];

  const addProducts = (items) => {
    for (const item of items) catalog.push({ ...item, orden: catalog.length + 1 });
  };

  const fromFlavors = ({ categoria, sabores, descripciones, precio, presentacion, toNombre }) => {
    if (precio == null) throw new Error(`Sin precio en el Excel para "${categoria}".`);
    if (sabores.length !== descripciones.length) {
      throw new Error(
        `"${categoria}": ${sabores.length} sabores pero ${descripciones.length} descripciones en el Excel.`
      );
    }
    return sabores.map((sabor, index) =>
      makeProduct({
        nombre: toNombre(sabor),
        descripcion: descripciones[index],
        categoria,
        precio,
        presentacion,
      })
    );
  };

  const fromExtra = ({ cellText, categoria, precio, presentacion, toNombre }) => {
    const descripcion = descsOf(cellText)[0];
    if (!descripcion) throw new Error(`Sin descripción en celda extra para "${categoria}".`);
    return makeProduct({ nombre: toNombre(flat(cellText.split('(')[0])), descripcion, categoria, precio, presentacion });
  };

  const fromBlock = ({ cellText, categoria, presentacion }) =>
    parseBlock(cellText).map(({ nombre, precio, descripcion }) =>
      makeProduct({ nombre, descripcion, categoria, precio, presentacion })
    );

  const hamburguesasPack = packOf(cellValue(t1, 1, 3));
  addProducts(
    fromFlavors({
      categoria: 'Hamburguesas Veggie',
      sabores: ['Lentejas', 'Arroz', 'Zanahoria', 'Arvejas', 'Brócoli', 'Remolacha'],
      descripciones: descsOf(cellValue(t1, 2, 1)),
      precio: firstPrice(cellValue(t1, 1, 6)),
      presentacion: hamburguesasPack,
      toNombre: (sabor) => `Hamburguesa veggie de ${sabor.toLowerCase()}`,
    })
  );

  addProducts(
    fromFlavors({
      categoria: 'Milanesas Veggie',
      sabores: ['Calabaza', 'Acelga', 'Berenjenas'],
      descripciones: descsOf(cellValue(t1, 4, 1)),
      precio: firstPrice(cellValue(t1, 3, 6)),
      presentacion: packOf(cellValue(t1, 3, 2)),
      toNombre: (sabor) => `Milanesa veggie de ${sabor.toLowerCase()}`,
    })
  );

  const wrapsCell = cellValue(t1, 5, 0);
  addProducts(
    fromBlock({
      cellText: wrapsCell,
      categoria: 'Wraps',
      presentacion: packOf(String(wrapsCell).split('\n')[0]) || 'Pack individual',
    })
  );

  const tartasPack = packOf(cellValue(t2, 0, 0)) || 'Pack individual';
  const tartaGreenPrecio = firstPrice(cellValue(t2, 1, 0));
  addProducts(
    fromFlavors({
      categoria: 'Tartas',
      sabores: ['Calabaza', 'Zapallito', 'Zanahoria', 'Acelga'],
      descripciones: descsOf(cellValue(t2, 2, 1)),
      precio: tartaGreenPrecio,
      presentacion: tartasPack,
      toNombre: (sabor) => `Tarta de ${sabor.toLowerCase()}`,
    })
  );
  addProducts([
    fromExtra({
      cellText: cellValue(t2, 3, 0),
      categoria: 'Tartas',
      precio: tartaGreenPrecio,
      presentacion: tartasPack,
      toNombre: (nombre) => `Tarta de ${nombre.toLowerCase()}`,
    }),
  ]);
  addProducts(
    fromFlavors({
      categoria: 'Tartas',
      sabores: ['Pollo al verdeo', 'Jamón & queso', 'Capresse'],
      descripciones: descsOf(cellValue(t2, 5, 2)),
      precio: firstPrice(cellValue(t2, 4, 0)),
      presentacion: tartasPack,
      toNombre: (sabor) => `Tarta de ${sabor.toLowerCase()}`,
    })
  );

  const canastitasCell = cellValue(t2, 6, 4);
  addProducts(
    fromFlavors({
      categoria: 'Canastitas',
      sabores: ['Calabaza', 'Batata', 'Lentejas'],
      descripciones: descsOf(cellValue(t2, 7, 1)),
      precio: firstPrice(canastitasCell),
      presentacion: packOf(canastitasCell),
      toNombre: (sabor) => `Canastita saludable de ${sabor.toLowerCase()}`,
    })
  );

  const empanadasCell = cellValue(t2, 8, 3);
  addProducts(
    fromFlavors({
      categoria: 'Empanadas',
      sabores: ['Carne', 'Pollo al verdeo', 'Jamón & queso', 'Capresse'],
      descripciones: descsOf(empanadasCell),
      precio: firstPrice(empanadasCell),
      presentacion: packOf(empanadasCell),
      toNombre: (sabor) => `Empanada de ${sabor.toLowerCase()}`,
    })
  );
  addProducts([
    fromExtra({
      cellText: cellValue(t2, 9, 0),
      categoria: 'Empanadas',
      precio: firstPrice(empanadasCell),
      presentacion: packOf(empanadasCell),
      toNombre: (nombre) => `Empanada de ${nombre.toLowerCase()}`,
    }),
  ]);

  addProducts(
    fromBlock({
      cellText: cellValue(t2, 10, 0),
      categoria: 'Novedades',
      presentacion: '1 u',
    })
  );

  return catalog;
};

const buildCategories = () =>
  CATEGORIAS.map((nombre, index) => ({
    id: slugify(nombre),
    nombre,
    slug: slugify(nombre),
    descripcion: '',
    imagen: `/images/categories/${slugify(nombre)}.png`,
    orden: index + 1,
  }));

const wipeDatabase = async (db) => {
  const collections = await db.listCollections();
  const deleted = [];
  for (const collection of collections) {
    let count = 0;
    for (;;) {
      const snapshot = await collection.limit(400).get();
      if (snapshot.empty) break;
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      count += snapshot.docs.length;
    }
    deleted.push(`${collection.id}: ${count}`);
  }
  return deleted;
};

const countDocs = async (db, collectionId) =>
  (await db.collection(collectionId).count().get()).data().count;

const printCatalog = (products) => {
  for (const product of products) {
    console.log(
      `  ${String(product.orden).padStart(2)}. ${product.nombre.padEnd(42)} $${String(product.precio).padStart(6)}  [${product.categoria}]`
    );
  }
};

const main = async () => {
  try {
    const dryRun = process.argv.includes('--dry-run');
    const products = buildCatalog();
    const categories = buildCategories();

    if (process.argv.includes('--json')) {
      console.log(JSON.stringify(products, null, 2));
      return;
    }

    console.log(`Archivo: ${EXCEL_PATH}`);
    console.log(`Productos: ${products.length} | Categorías: ${categories.length}\n`);
    printCatalog(products);

    if (dryRun) {
      console.log('\n🔍 Dry run: no se modificó la base de datos.');
      return;
    }

    const db = getAdminDb();
    const project = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
    console.log(`\nProyecto Firebase: ${project}`);
    console.log('Borrando colecciones existentes...');
    const deleted = await wipeDatabase(db);
    console.log(deleted.length ? deleted.map((line) => `  - ${line}`).join('\n') : '  (no había colecciones)');

    console.log('\nEscribiendo categorías y productos...');
    const batch = db.batch();
    for (const category of categories) batch.set(db.collection('categorias').doc(category.id), category);
    for (const product of products) batch.set(db.collection('productos').doc(product.slug), product);
    await batch.commit();

    const [productCount, categoryCount] = await Promise.all([
      countDocs(db, 'productos'),
      countDocs(db, 'categorias'),
    ]);
    console.log(`\n✅ Listo: ${productCount} productos y ${categoryCount} categorías en "${project}".`);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exitCode = 1;
  }
};

main();
