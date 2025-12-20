# -----------------------
#       BUILDER
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -----------------------
#     PRODUCTION
# -----------------------
FROM node:20-alpine AS production

WORKDIR /app

# Copier node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copier le build compilé
COPY --from=builder /app/dist ./dist

# Copier swagger.yml DANS le dist pour que l'app le trouve
COPY --from=builder /app/swagger.yml ./dist/swagger.yml

EXPOSE 3000
CMD ["node", "dist/bin/www.js"]
