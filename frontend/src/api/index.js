import axios from "axios";

const API_BASE = "http://localhost:3000";

const api = axios.create({ baseURL: API_BASE });

export const dashboardApi = {
  getSummary: () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return api.get("/api/dashboard/summary", { params: { tz } }).then((r) => r.data);
  },
};

export const salesApi = {
  getRecent: (limit = 10) =>
    api.get("/api/sales/recent", { params: { limit } }).then((r) => r.data),
  createSale: (payload) => api.post("/api/sales", payload).then((r) => r.data),
};

export const inventoryApi = {
  getMedicines: (params = {}) =>
    api.get("/api/inventory/medicines", { params }).then((r) => r.data),
  getMedicine: (id) =>
    api.get(`/api/inventory/medicines/${id}`).then((r) => r.data),
  createMedicine: (payload) =>
    api.post("/api/inventory/medicines", payload).then((r) => r.data),
  updateMedicine: (id, payload) =>
    api.put(`/api/inventory/medicines/${id}`, payload).then((r) => r.data),
  updateStatus: (id, status) =>
    api
      .patch(`/api/inventory/medicines/${id}/status`, null, { params: { status } })
      .then((r) => r.data),
  deleteMedicine: (id) =>
    api.delete(`/api/inventory/medicines/${id}`).then((r) => r.data),
  getCategories: () =>
    api.get("/api/inventory/categories").then((r) => r.data),
};

export const purchaseOrderApi = {
  getOrders: (params = {}) =>
    api.get("/api/purchase-orders", { params }).then((r) => r.data),
  getRecent: (limit = 10) =>
    api.get("/api/purchase-orders", { params: { limit } }).then((r) => r.data),
  createOrder: (payload) =>
    api.post("/api/purchase-orders", payload).then((r) => r.data),
  updateStatus: (id, status) =>
    api.patch(`/api/purchase-orders/${id}/status`, { status }).then((r) => r.data),
};
