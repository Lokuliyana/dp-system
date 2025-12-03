import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

// Request: attach access token
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: refresh on 401
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

function flushQueue(token: string) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const r = await axios.post(`${API_BASE}/app-users/refresh`, {
          token: refreshToken,
        });

        const newAccess = r.data?.data?.accessToken;
        localStorage.setItem("accessToken", newAccess);

        flushQueue(newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return axiosInstance(original);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);
