import { collection, getDocs, doc, updateDoc, query, orderBy, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

const ORDERS_COLLECTION = 'ordenes';
const PRODUCTS_COLLECTION = 'productos';

export const createOrder = async (order, cartItems) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('El carrito está vacío.');
  }

  const quantities = new Map();
  for (const item of cartItems) {
    const productId = typeof item.id === 'string' ? item.id.trim() : '';
    const quantity = Number(item.cantidad);
    if (!productId || productId.includes('/') || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error('El carrito contiene un producto o cantidad no válidos.');
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }
  const orderRef = doc(collection(db, ORDERS_COLLECTION));
  const productRefs = [...quantities.keys()].map((id) => doc(db, PRODUCTS_COLLECTION, id));
  let savedOrder;

  await runTransaction(db, async (transaction) => {
    const snapshots = await Promise.all(productRefs.map((productRef) => transaction.get(productRef)));
    const orderItems = [];

    snapshots.forEach((snapshot) => {
      if (!snapshot.exists() || snapshot.data().activo !== true) {
        throw new Error('STOCK_INSUFFICIENT:producto');
      }

      const product = snapshot.data();
      const quantity = quantities.get(snapshot.id);
      const stock = Number(product.stock) || 0;
      const price = Number(product.precio);
      if (stock < quantity) throw new Error(`STOCK_INSUFFICIENT:${product.nombre || 'producto'}`);
      if (!Number.isFinite(price) || price < 0) throw new Error('PRODUCT_INVALID');

      orderItems.push({
        productId: snapshot.id,
        nombre: product.nombre,
        cantidad: quantity,
        precioUnitario: price,
        subtotal: price * quantity,
      });
    });

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    savedOrder = {
      id: orderRef.id,
      cliente: order.cliente,
      entrega: order.entrega,
      productos: orderItems,
      subtotal: total,
      total,
      metodoPago: order.metodoPago,
      estado: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    snapshots.forEach((snapshot, index) => {
      const productRef = productRefs[index];
      transaction.update(productRef, {
        stock: (Number(snapshot.data().stock) || 0) - quantities.get(snapshot.id),
        ultimaReservaId: orderRef.id,
      });
    });
    transaction.set(orderRef, savedOrder);
  });

  return savedOrder;
};

export const getAllOrders = async () => {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((orderDoc) => {
    const data = orderDoc.data();
    const products = Array.isArray(data.productos) ? data.productos : Object.values(data.productos || {});
    return { id: orderDoc.id, ...data, productos: products };
  });
};

export const updateOrderStatus = async (id, status) => {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  await runTransaction(db, async (transaction) => {
    const orderSnapshot = await transaction.get(docRef);
    if (!orderSnapshot.exists()) throw new Error('No se encontró el pedido.');
    if (orderSnapshot.data().estado === 'cancelada') {
      throw new Error('No se puede cambiar el estado de un pedido cancelado.');
    }
    transaction.update(docRef, { estado: status });
  });
};

export const restoreStock = async (order) => {
  const orderRef = doc(db, ORDERS_COLLECTION, order.id);

  await runTransaction(db, async (transaction) => {
    const orderSnapshot = await transaction.get(orderRef);
    if (!orderSnapshot.exists()) throw new Error('No se encontró el pedido.');

    const orderData = orderSnapshot.data();
    if (orderData.estado === 'cancelada') return;
    if (!['pendiente', 'confirmada'].includes(orderData.estado)) {
      throw new Error('Solo se pueden cancelar pedidos pendientes o confirmados.');
    }

    const items = Array.isArray(orderData.productos)
      ? orderData.productos
      : Object.values(orderData.productos || {});
    const quantities = new Map();
    for (const item of items) {
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + Number(item.cantidad));
    }
    const productRefs = [...quantities.keys()].map((id) => doc(db, PRODUCTS_COLLECTION, id));
    const productSnapshots = await Promise.all(productRefs.map((productRef) => transaction.get(productRef)));

    productSnapshots.forEach((productSnapshot, index) => {
      if (productSnapshot.exists()) {
        const productRef = productRefs[index];
        transaction.update(productRef, {
          stock: (Number(productSnapshot.data().stock) || 0) + quantities.get(productRef.id),
        });
      }
    });
    transaction.update(orderRef, { estado: 'cancelada' });
  });
};
