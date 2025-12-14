import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Automatically attach token (optional)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Book APIs
export const saveInsertPlanApi = (payload) => API.post("/book/book-inserts/plan", payload);
export const saveBookApi = (payload) => API.post("/book/books", payload);
export const getNextRegularApi = () => API.get("/book/books/next-regular");
export const listBooksApi = () => API.get("/book/books");

// Auth APIs
export const registerUser = (payload) => API.post("/user/register", payload);
export const loginUser = (payload) => API.post("/user/login", payload);
export const forgotPassword = (payload) => API.post("/user/forgot-password", payload);
export const confirmOtp = (payload) => API.post("/user/confirm-otp", payload);
export const resetPassword = (payload) => API.post("/user/reset-password", payload);
export const getProfile = () => API.get("/user/profile");

export default API;
