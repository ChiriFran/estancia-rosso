import { storeConfig } from '../config/store';
import { formatPrice } from './formatPrice';

export const normalizeWhatsAppPhone = (phone) => {
  let digits = String(phone || '').replace(/\D/g, '');

  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('54')) {
    digits = digits.slice(2).replace(/^0/, '');
    return `549${digits}`;
  }

  return `549${digits.replace(/^0/, '')}`;
};

export const generateWhatsAppUrl = (order) => {
  const productsList = order.productos
    .map((p) => `• ${p.nombre} x${p.cantidad} — ${formatPrice(p.subtotal)}`)
    .join('\n');

  const entregaInfo = order.entrega.tipo === 'envio'
    ? `Envío a domicilio\n` +
      `Dirección: ${order.entrega.direccion}\n` +
      `Localidad: ${order.entrega.localidad}${order.entrega.codigoPostal ? ` (${order.entrega.codigoPostal})` : ''}\n` +
      (order.entrega.referencia ? `Referencia: ${order.entrega.referencia}\n` : '')
    : 'Retiro en local';

  const pagoInfo = order.metodoPago === 'transferencia'
    ? 'Transferencia bancaria'
    : 'Efectivo';

  const message = `Hola! Quiero hacer un pedido\n` +
    `\n` +
    `${productsList}\n` +
    `\n` +
    `Total: *${formatPrice(order.total)}*\n` +
    `\n` +
    `${entregaInfo}\n` +
    `${pagoInfo}\n` +
    `\n` +
    `*${order.cliente.nombre} ${order.cliente.apellido}*\n` +
    `Tel: ${order.cliente.telefono}\n` +
    `${order.cliente.email}\n` +
    `\n` +
    `Adjunto comprobante. Gracias!`;

  return `https://wa.me/${storeConfig.whatsapp}?text=${encodeURIComponent(message)}`;
};
