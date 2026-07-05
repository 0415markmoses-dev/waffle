# Simulates the GitHub Actions CI environment (ubuntu-latest + node 22)
# Usage: npm run sim:tests
FROM node:22

WORKDIR /app

# Install deps first — cached unless package*.json change
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# CI=true makes vitest run non-interactively, exactly like GitHub Actions
ENV CI=true

CMD ["npm", "test"]
