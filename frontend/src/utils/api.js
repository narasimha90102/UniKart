import axios from "axios";

const getBaseURL = () => {
  // Development (Vite proxy handles /api → backend)
  if (import.meta.env.DEV) {
    return "/api";
  }

  // Production (Render / Backend URL)
  return import.meta.env.VITE_API_URL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------------------
   REQUEST INTERCEPTOR
---------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("unikart_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------------------
   RESPONSE INTERCEPTOR
---------------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (
      error.response?.status === 401 &&
      !isLoginRequest
    ) {
      localStorage.removeItem("unikart_token");
      localStorage.removeItem("unikart_user");

      // prevent infinite redirect loops
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?expired=true";
      }
    }

    return Promise.reject(error);
  }
);

export default api;