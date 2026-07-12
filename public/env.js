// Runtime configuration placeholder.
//
// In the Docker image, docker-entrypoint.sh regenerates this file from the
// container's environment (VITE_API_URL) on every start, so the API URL can
// be set per-deployment without rebuilding the image. Locally (npm run dev /
// vite preview) this default (empty string) is used, and src/Services/Http.js
// falls back to build-time / localhost resolution instead.
window.__ENV__ = {
    VITE_API_URL: ""
};
