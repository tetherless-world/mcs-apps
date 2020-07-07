# Build
FROM node:12 as build
WORKDIR /build
COPY /app/kg/gui/package.json .
RUN npm install
COPY /app/kg/gui .
RUN npm run build

# Deployment
FROM nginx:1.17.10

RUN apt-get update && apt-get install -y curl

COPY /app/kg/gui/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /build/dist /usr/share/nginx/html

EXPOSE 80
