# # Image size ~ 400MB
# FROM node:21-alpine3.18 as builder

# WORKDIR /app

# RUN corepack enable && corepack prepare pnpm@latest --activate
# ENV PNPM_HOME=/usr/local/bin

# COPY . .

# COPY package*.json *-lock.yaml ./

# RUN apk add --no-cache --virtual .gyp \
#         python3 \
#         make \
#         g++ \
#     && apk add --no-cache git \
#     && pnpm install \
#     && apk del .gyp

# FROM node:21-alpine3.18 as deploy

# WORKDIR /app

# ARG PORT
# ENV PORT $PORT
# EXPOSE $PORT

# COPY --from=builder /app/assets ./assets
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/*.json /app/*-lock.yaml ./

# RUN corepack enable && corepack prepare pnpm@latest --activate 
# ENV PNPM_HOME=/usr/local/bin

# RUN npm cache clean --force && pnpm install --production --ignore-scripts \
#     && addgroup -g 1001 -S nodejs && adduser -S -u 1001 nodejs \
#     && rm -rf $PNPM_HOME/.npm $PNPM_HOME/.node-gyp

# CMD ["npm", "start"]
# Usa una imagen base ligera de Node.js
FROM node:21-alpine3.18

WORKDIR /app

# Copia los archivos necesarios
COPY package*.json ./
RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++ \
    && apk add --no-cache git \
    && npm install \
    && apk del .gyp

COPY . .

# Expone el puerto definido en la variable de entorno
ARG PORT
ENV PORT $PORT
EXPOSE $PORT

RUN npm cache clean --force \
    && addgroup -g 1001 -S nodejs && adduser -S -u 1001 nodejs \
    && rm -rf /root/.npm /root/.node-gyp

CMD ["npm", "start"]
