import { useState, useEffect } from 'react';
import { getAllOrders } from '../services/orders';
import { formatPrice } from '../utils/formatPrice';
import { normalizeWhatsAppPhone } from '../utils/whatsapp';
import './AdminClients.css';

const clientKey = (order) => {
  const { cliente = {} } = order;
  return [cliente.nombre, cliente.apellido, cliente.telefono]
    .map((value) => String(value || '').trim().toLocaleLowerCase('es-AR'))
    .join('|');
};

const clientCardKey = (client) => {
  return [client.nombre, client.apellido, client.telefono]
    .map((value) => String(value || '').trim().toLocaleLowerCase('es-AR'))
    .join('|');
};

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  enviada: 'Enviada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};

const STATUS_COLORS = {
  pendiente: 'admin__status--pendiente',
  confirmada: 'admin__status--confirmada',
  enviada: 'admin__status--enviada',
  entregada: 'admin__status--entregada',
  cancelada: 'admin__status--cancelada',
};

const buildClients = (orders) => {
  const map = new Map();

  orders.forEach((order) => {
    const { cliente = {}, entrega = {} } = order;
    const key = clientKey(order);
    if (!map.has(key)) {
      map.set(key, {
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        localidades: new Set(),
        pedidos: [],
        total: 0,
        ultimoPedido: order.createdAt || '',
      });
    }

    const client = map.get(key);
    client.pedidos.push({
      id: order.id,
      estado: order.estado || '',
      total: order.total || 0,
      createdAt: order.createdAt || '',
      metodoPago: order.metodoPago || '',
      productos: order.productos || [],
    });
    client.total += order.total || 0;
    if (entrega.localidad) {
      client.localidades.add(entrega.localidad);
    }
    if ((order.createdAt || '') >= client.ultimoPedido) {
      client.ultimoPedido = order.createdAt;
    }
  });

  return Array.from(map.values()).map((client) => ({
    ...client,
    localidades: Array.from(client.localidades).join(', '),
    pedidos: client.pedidos.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
  }));
};

const AdminClients = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKey, setExpandedKey] = useState(null);

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const clients = buildClients(orders);

  const filteredClients = clients
    .filter((client) => {
      const text = `${client.nombre} ${client.apellido} ${client.email} ${client.telefono}`.toLocaleLowerCase('es-AR');
      return text.includes(searchTerm.trim().toLocaleLowerCase('es-AR'));
    })
    .sort((a, b) => b.total - a.total);

  if (loading) {
    return <p className="admin-clients__loading">Cargando clientes...</p>;
  }

  return (
    <div className="admin-clients">
      <div className="admin__toolbar">
        <label className="admin__search-label" htmlFor="admin-client-search">Buscar por nombre, email o teléfono</label>
        <input
          id="admin-client-search"
          className="admin__search"
          type="search"
          placeholder="Nombre, email o teléfono"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <p className="admin-products__count">{filteredClients.length} clientes</p>

      {filteredClients.length === 0 ? (
        <p className="admin__empty">No hay clientes que coincidan con la búsqueda.</p>
      ) : (
        filteredClients.map((client) => {
          const clientKey = clientCardKey(client);
          const isExpanded = expandedKey === clientKey;
          return (
            <div key={clientKey} className="admin__order-card admin-clients__card">
              <div className="admin__order-header">
                <span className="admin-clients__name">{client.nombre} {client.apellido}</span>
                <span className="admin-clients__badge">
                  {client.pedidos.length} pedido{client.pedidos.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="admin__order-info">
                <span>{client.telefono}</span>
                <span>{formatPrice(client.total)}</span>
              </div>
              <div className="admin__order-date">{client.email}</div>
              <div className="admin-clients__meta">
                {client.localidades && <span className="admin-clients__localidad">{client.localidades}</span>}
                {client.ultimoPedido && (
                  <span className="admin-clients__last-order">
                    Último pedido: {new Date(client.ultimoPedido).toLocaleDateString('es-AR')}
                  </span>
                )}
              </div>
              {normalizeWhatsAppPhone(client.telefono) && (
                <a
                  className="admin__whatsapp-link"
                  href={`https://wa.me/${normalizeWhatsAppPhone(client.telefono)}?text=${encodeURIComponent(`Hola ${client.nombre}, te contacto desde Estancia Rosso.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              )}
              <div className="admin-clients__orders-toggle">
                <button
                  className="admin-clients__expand-btn"
                  type="button"
                  onClick={() => setExpandedKey((prev) => (prev === clientKey ? null : clientKey))}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? 'Ocultar pedidos' : `Ver pedidos (${client.pedidos.length})`}
                  <span className={`admin-clients__expand-icon ${isExpanded ? 'admin-clients__expand-icon--open' : ''}`}>▾</span>
                </button>
              </div>

              {isExpanded && (
                <div className="admin-clients__orders">
                  {client.pedidos.length === 0 ? (
                    <p className="admin-clients__orders-empty">Sin pedidos registrados.</p>
                  ) : (
                    client.pedidos.map((order) => (
                      <div key={order.id} className="admin-clients__order">
                        <div className="admin-clients__order-header">
                          <span className="admin__order-id">{order.id}</span>
                          <span className={`admin__status ${STATUS_COLORS[order.estado] || 'admin__status--pendiente'}`}>
                            {STATUS_LABELS[order.estado] || order.estado}
                          </span>
                        </div>
                        <div className="admin-clients__order-meta">
                          <span>{new Date(order.createdAt).toLocaleDateString('es-AR')}</span>
                          <span className="admin-clients__order-payment">
                            {order.metodoPago === 'transferencia' ? 'Transferencia' : 'Efectivo'}
                          </span>
                        </div>
                        <div className="admin-clients__order-products">
                          {order.productos.map((item, i) => (
                            <div key={i} className="admin__detail-product">
                              <span>{item.nombre} x{item.cantidad}</span>
                              <span>{formatPrice(item.subtotal ?? (item.precioUnitario || 0) * item.cantidad)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="admin__detail-total">
                          <span>Total</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminClients;