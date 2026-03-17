/**
 * Service API pour communiquer avec le backend SQLite
 * Toutes les requêtes passent par ce service
 */

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

// Helper pour gérer les requêtes
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur API');
  }

  return response.json();
}

// ===============================
// API UTILISATEURS
// ===============================

export const usersApi = {
  login: (username: string, password: string) => apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  getAll: () => apiRequest('/users'),
  create: (user: any) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
  update: (id: string, user: any) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  }),
  delete: (id: string) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// ===============================
// API SACS
// ===============================

export const bagsApi = {
  getAll: () => apiRequest('/bags'),
  getByQrCode: (qrCode: string) => apiRequest(`/bags/qr/${qrCode}`),
  create: (bag: any) => apiRequest('/bags', {
    method: 'POST',
    body: JSON.stringify(bag),
  }),
  update: (id: string, bag: any) => apiRequest(`/bags/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bag),
  }),
  delete: (id: string) => apiRequest(`/bags/${id}`, {
    method: 'DELETE',
  }),
};

// ===============================
// API PRODUITS PHARMACIE
// ===============================

export const pharmacyProductsApi = {
  getAll: () => apiRequest('/pharmacy-products'),
  create: (product: any) => apiRequest('/pharmacy-products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  update: (id: string, product: any) => apiRequest(`/pharmacy-products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),
  delete: (id: string) => apiRequest(`/pharmacy-products/${id}`, {
    method: 'DELETE',
  }),
};

// ===============================
// API MATÉRIEL OPÉRATIONNEL
// ===============================

export const operationalEquipmentApi = {
  getAll: () => apiRequest('/operational-equipment'),
  create: (equipment: any) => {
    const payload = {
      ...equipment,
      qrCode: equipment.qrCode ?? equipment.barcode,
      controlDate: equipment.controlDate ?? equipment.lastControlDate,
      expiryDate: equipment.expiryDate ?? equipment.peremptionDate,
    };
    return apiRequest('/operational-equipment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update: (id: string, equipment: any) => {
    const payload = {
      ...equipment,
      qrCode: equipment.qrCode ?? equipment.barcode,
      controlDate: equipment.controlDate ?? equipment.lastControlDate,
      expiryDate: equipment.expiryDate ?? equipment.peremptionDate,
    };
    return apiRequest(`/operational-equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  delete: (id: string) => apiRequest(`/operational-equipment/${id}`, {
    method: 'DELETE',
  }),
};

// ===============================
// API HISTORIQUE DE CONTRÔLE
// ===============================

export const controlHistoryApi = {
  getAll: () => apiRequest('/control-history'),
  getByBagId: (bagId: string) => apiRequest(`/control-history/bag/${bagId}`),
  create: (history: any) => apiRequest('/control-history', {
    method: 'POST',
    body: JSON.stringify(history),
  }),
};

// ===============================
// API LOGS
// ===============================

export const logsApi = {
  getAll: () => apiRequest('/logs'),
  create: (log: any) => apiRequest('/logs', {
    method: 'POST',
    body: JSON.stringify(log),
  }),
  clear: () => apiRequest('/logs', {
    method: 'DELETE',
  }),
};

// ===============================
// API RAPPORTS DE BUGS
// ===============================

export const bugReportsApi = {
  getAll: () => apiRequest('/bug-reports'),
  create: (report: any) => apiRequest('/bug-reports', {
    method: 'POST',
    body: JSON.stringify(report),
  }),
  updateStatus: (id: string, status: string) => apiRequest(`/bug-reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  delete: (id: string) => apiRequest(`/bug-reports/${id}`, {
    method: 'DELETE',
  }),
};

// ===============================
// API RAPPORTS D'INSPECTION
// ===============================

export const inspectionReportsApi = {
  getAll: () => apiRequest('/inspection-reports'),
  create: (report: any) => apiRequest('/inspection-reports', {
    method: 'POST',
    body: JSON.stringify(report),
  }),
};

// ===============================
// API CATÉGORIES
// ===============================

export const categoriesApi = {
  getAll: () => apiRequest('/categories'),
  create: (category: any) => apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  }),
  delete: (id: string) => apiRequest(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// ===============================
// API SANTÉ
// ===============================

export const healthApi = {
  check: () => apiRequest('/health'),
};
