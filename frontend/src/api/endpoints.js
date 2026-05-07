import api from "./client";

export const authApi = {
  register: (payload) => api.post("/auth/register/", payload),
  login: (payload) => api.post("/auth/login/", payload),
  profile: () => api.get("/profile/"),
  updateProfile: (payload) => api.patch("/profile/", payload),
};

export const categoryApi = {
  list: (params) => api.get("/categories/", { params }),
  create: (payload) => api.post("/categories/", payload),
};

export const transactionApi = {
  list: (params) => api.get("/transactions/", { params }),
  create: (payload) => api.post("/transactions/", payload),
  update: (id, payload) => api.patch(`/transactions/${id}/`, payload),
  remove: (id) => api.delete(`/transactions/${id}/`),
  exportCsv: (params) => api.get("/transactions/export-csv/", { params, responseType: "blob" }),
  exportPdf: (params) => api.get("/transactions/export-pdf/", { params, responseType: "blob" }),
};

export const budgetApi = {
  list: (params) => api.get("/budgets/", { params }),
  create: (payload) => api.post("/budgets/", payload),
  update: (id, payload) => api.patch(`/budgets/${id}/`, payload),
  remove: (id) => api.delete(`/budgets/${id}/`),
};

export const dashboardApi = {
  get: () => api.get("/dashboard/"),
};
