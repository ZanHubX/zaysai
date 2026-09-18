import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        Accept: "application/json",
    },
});

/*
|--------------------------------------------------------------------------
| Global Request Interceptor
|--------------------------------------------------------------------------
|
| Adds the seller authentication token automatically.
|
*/

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("seller_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    /*
    |--------------------------------------------------------------------------
    | Content-Type
    |--------------------------------------------------------------------------
    |
    | Do NOT force application/json globally.
    |
    | Axios will automatically set the correct Content-Type and boundary
    | when FormData is used for file uploads.
    |
    */

    if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    } else {
        delete config.headers["Content-Type"];
    }

    /*
    |--------------------------------------------------------------------------
    | Global Loading Handler
    |--------------------------------------------------------------------------
    |
    | Start global loader after a short delay.
    | This prevents flashing the loader for very fast requests.
    |
    */

    config._loadingTimer = setTimeout(() => {
        window.dispatchEvent(
            new Event("zaysai:loading:start")
        );

        config._globalLoaderStarted = true;
    }, 250);

    return config;
});

/*
|--------------------------------------------------------------------------
| Global Response Interceptor
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Finish Global Loading
|--------------------------------------------------------------------------
*/

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