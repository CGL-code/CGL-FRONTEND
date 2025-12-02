import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Automatically attach token (optional but recommended)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const registerUser = (payload) => API.post("/user/register", payload);
export const loginUser = (payload) => API.post("/user/login", payload);
export const forgotPassword = (payload) =>
  API.post("/user/forgot-password", payload);
export const confirmOtp = (payload) =>
  API.post("/user/confirm-otp", payload);
export const resetPassword = (payload) =>
  API.post("/user/reset-password", payload);
export const getProfile = () => API.get("/user/profile");

export default API;
