import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// ── Toast notification system ────────────────────────────────
let toastListeners = [];
export const onToast = (cb) => {
  toastListeners.push(cb);
  return () => { toastListeners = toastListeners.filter((l) => l !== cb); };
};
const fireToast = (msg, type = "error") =>
  toastListeners.forEach((cb) => cb({ msg, type, id: Date.now() }));

// ── Axios Response Interceptor ───────────────────────────────
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      (status === 404 ? "Resource not found" :
        status === 500 ? "Internal server error" :
          err.message || "Network error");
    fireToast(msg, "error");
    return Promise.reject(err);
  }
);

// ── Showrooms ──────────────────────────────────────────────
export const getShowrooms = () => API.get("/showrooms");
export const getShowroom = (id) => API.get(`/showrooms/${id}`);
export const createShowroom = (data) => API.post("/showrooms", data);
export const updateShowroom = (id, data) => API.put(`/showrooms/${id}`, data);
export const deleteShowroom = (id) => API.delete(`/showrooms/${id}`);

// ── Vehicles ───────────────────────────────────────────────
export const getVehicles = () => API.get("/vehicles");
export const getVehicle = (id) => API.get(`/vehicles/${id}`);
export const getVehicleFull = (id) => API.get(`/vehicles/${id}/full`);
export const getVehiclesByShowroom = (showroomId) =>
  API.get(`/vehicles/showroom/${showroomId}`);
export const createVehicle = (data) => {
  const showroomId = data.showroomId || (data.showroom && data.showroom.id) || data.showroom;
  return API.post(`/vehicles?showroomId=${showroomId}`, data);
};
export const updateVehicle = (id, data) => API.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => API.delete(`/vehicles/${id}`);

// ── Features ───────────────────────────────────────────────
export const getFeaturesByVehicle = (vehicleId) =>
  API.get(`/features/vehicle/${vehicleId}`);
export const createFeature = (data) => API.post("/features", data);

// ── Tax ────────────────────────────────────────────────────
export const getTaxByVehicle = (vehicleId) =>
  API.get(`/tax/vehicle/${vehicleId}`);
export const createTax = (data) => API.post("/tax", data);

// ── Insurance ──────────────────────────────────────────────
export const getInsuranceByVehicle = (vehicleId) =>
  API.get(`/insurance/vehicle/${vehicleId}`);
export const createInsurance = (data) => API.post("/insurance", data);

// ── Customers ──────────────────────────────────────────────
export const getCustomers = () => API.get("/customers");
export const getCustomer = (id) => API.get(`/customers/${id}`);
export const createCustomer = (data) => API.post("/customers", data);
export const updateCustomer = (id, data) => API.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);

// ── Sales ──────────────────────────────────────────────────
export const getSales = () => API.get("/sales");
export const getSale = (id) => API.get(`/sales/${id}`);
export const getSalesByCustomer = (customerId) =>
  API.get(`/sales/customer/${customerId}`);
export const createSale = (data) => API.post("/sales", data);
export const updateSale = (id, data) => API.put(`/sales/${id}`, data);
export const deleteSale = (id) => API.delete(`/sales/${id}`);

// ── Payments ───────────────────────────────────────────────
export const getPayments = () => API.get("/payments");
export const getPaymentsBySale = (saleId) =>
  API.get(`/payments/sale/${saleId}`);
export const createPayment = (data) => API.post("/payments", data);

// ── Services ───────────────────────────────────────────────
export const getServices = () => API.get("/services");
export const getServicesByShowroom = (showroomId) =>
  API.get(`/services/showroom/${showroomId}`);
export const createService = (data) => API.post("/services", data);
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);

// ── Analytics ──────────────────────────────────────────────
export const getAnalytics = () => API.get("/analytics");

export default API;
