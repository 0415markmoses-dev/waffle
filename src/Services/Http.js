import axios from "axios";
import {getCurrentJWT} from "../Store/auth.js";

// API base URL resolution, in order:
// 1. Runtime value injected into window.__ENV__ by the Docker entrypoint
//    (see public/env.js + docker-entrypoint.sh) from the VITE_API_URL
//    container env var — lets a single built image be pointed at any API
//    without rebuilding.
// 2. Build-time VITE_API_URL, if the app was built with one baked in
//    (e.g. `VITE_API_URL=... npm run build`).
// 3. localhost fallback for local dev (`npm run dev` / `vite preview`).
// 4. Last-resort default so the app still boots if nothing is configured.
const runtimeApiUrl = window.__ENV__?.VITE_API_URL;
const buildTimeApiUrl = import.meta.env.VITE_API_URL;

let baseURL = runtimeApiUrl || buildTimeApiUrl;

if (!baseURL) {
    baseURL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost'
        : 'https://ezmeet.arkdev.io';
}

const Http = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
    },
})

// execute a function before each request
Http.interceptors.request.use((config) => {
    // if request is method PATCH, add Content-Type application/merge-patch+json
    if (config.method === 'patch') {
        config.headers['Content-Type'] = 'application/merge-patch+json';
    }
    // if there is a POST without an explicit Content-Type, default to application/ld+json
    // (don't override multipart/form-data or other explicitly set types)
    if (config.method === 'post' && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/ld+json';
    }


    let jwt = getCurrentJWT();
    if (jwt !== null && jwt !== undefined && jwt !== '') {
        if (config.headers['Authorization'] === null || config.headers['Authorization'] === undefined) {
            config.headers['Authorization'] = `Bearer ${jwt}`;
        }
    }
    // do something before request is sent
    return config;
}, (error) => {
    // do something with request error
    return Promise.reject(error);
});

export default Http;
