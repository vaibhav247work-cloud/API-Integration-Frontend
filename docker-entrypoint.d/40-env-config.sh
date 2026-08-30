#!/bin/sh
set -eu

cat > /usr/share/nginx/html/env.js <<EOF
window.__APP_CONFIG__ = {
  APP_TITLE: "${APP_TITLE:-Integration Hub}",
  API_BASE_URL: "${API_BASE_URL:-/api}",
  API_TIMEOUT_MS: "${API_TIMEOUT_MS:-30000}",
  APP_ENV: "${APP_ENV:-production}"
};
EOF
