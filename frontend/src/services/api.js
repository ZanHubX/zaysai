import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const sellerToken = localStorage.getItem("seller_token");
    const adminToken = localStorage.getItem("admin_token");

    const isAdminRequest = config.url?.startsWith("/admin");

    const token = isAdminRequest
        ? adminToken
        : sellerToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    config._loadingTimer = setTimeout(() => {
        window.dispatchEvent(
            new Event("zaysai:loading:start")
        );

        config._globalLoaderStarted = true;
    }, 250);

    return config;
});

api.interceptors.response.use(
    (response) => {
        finishGlobalLoading(response.config);

        return response;
    },
    (error) => {
        if (error.config) {
            finishGlobalLoading(error.config);
        }

        return Promise.reject(error);
    }
);

function finishGlobalLoading(config) {
    if (!config) return;

    clearTimeout(config._loadingTimer);

    if (config._globalLoaderStarted) {
        window.dispatchEvent(
            new Event("zaysai:loading:stop")
        );
    }
}

export default api;