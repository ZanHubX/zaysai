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

    const isAdminRequest =
        config.url?.startsWith("/admin");

    const token = isAdminRequest
        ? adminToken
        : sellerToken;

    if (token) {
        config.headers.Authorization =
            `Bearer ${token}`;
    }

    /*
    |--------------------------------------------------------------------------
    | Handle FormData uploads
    |--------------------------------------------------------------------------
    |
    | For normal JSON requests:
    |     Content-Type = application/json
    |
    | For FormData requests:
    |     Remove Content-Type so the browser can automatically set:
    |
    |     multipart/form-data; boundary=...
    |
    */

    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    } else {
        config.headers["Content-Type"] =
            "application/json";
    }

    /*
    |--------------------------------------------------------------------------
    | Global Loading
    |--------------------------------------------------------------------------
    */

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
        finishGlobalLoading(
            response.config
        );

        return response;
    },

    (error) => {
        if (error.config) {
            finishGlobalLoading(
                error.config
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Maintenance Mode
        |--------------------------------------------------------------------------
        |
        | Laravel returns:
        |
        | HTTP 503
        |
        | {
        |     "message":
        |         "ZaySai is currently under maintenance.",
        |
        |     "maintenance": true
        | }
        |
        | Save the current URL before sending the user
        | to the maintenance page.
        |
        */

        if (
            error.response?.status === 503 &&
            error.response?.data?.maintenance === true
        ) {
            /*
            |--------------------------------------------------------------------------
            | Prevent Maintenance Page Loop
            |--------------------------------------------------------------------------
            */

            if (
                window.location.pathname !==
                "/maintenance.html"
            ) {
                /*
                |--------------------------------------------------------------------------
                | Save Current URL
                |--------------------------------------------------------------------------
                |
                | Example:
                |
                | http://localhost:5173/stores/game-hub
                |
                | or:
                |
                | http://localhost:5173/admin/dashboard
                |
                */

                sessionStorage.setItem(
                    "zaysai_return_url",
                    window.location.href
                );

                /*
                |--------------------------------------------------------------------------
                | Go To Maintenance Page
                |--------------------------------------------------------------------------
                */

                window.location.href =
                    "/maintenance.html";
            }
        }

        return Promise.reject(error);
    }
);


function finishGlobalLoading(config) {
    if (!config) return;

    clearTimeout(
        config._loadingTimer
    );

    if (
        config._globalLoaderStarted
    ) {
        window.dispatchEvent(
            new Event("zaysai:loading:stop")
        );
    }
}


export default api;