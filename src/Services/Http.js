import axios from "axios";
import {getCurrentJWT} from "../store/auth.js";

// current base url using window
let baseURL = 'https://ezmeet.arkdev.io';
// if current domain is localhost or 127.0.0.1 use https://localhost:5173 instead
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseURL = 'http://localhost';
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
    // if there is a POST, add Content-Type application/ld+json
    if (config.method === 'post') {
        config.headers['Content-Type'] = 'application/ld+json';
    }


    let jwt = getCurrentJWT();
    if (jwt !== null && jwt !== undefined && jwt !== '') {
        config.headers['Authorization'] = `Bearer ${jwt}`;
    }
    // do something before request is sent
    return config;
}, (error) => {
    // do something with request error
    return Promise.reject(error);
});

export default Http;
