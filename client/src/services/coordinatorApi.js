import axios from "axios";

const coordinatorApi = axios.create({
  baseURL: "http://localhost:5000/api/coordinator",
});

coordinatorApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default coordinatorApi;
