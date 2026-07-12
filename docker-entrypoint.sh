#!/bin/sh
set -e

# Regenerate the runtime config file from the container's environment on
# every start, so VITE_API_URL (and any other VITE_* runtime vars added
# below) can be set in the stack/compose file — or changed with
# `docker service update --env-add` — without rebuilding the image.
cat <<EOF > /usr/share/nginx/html/env.js
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL:-}"
};
EOF

exec "$@"
