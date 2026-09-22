import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,

    (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            const token = localStorage.getItem("token");

            if (token) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;