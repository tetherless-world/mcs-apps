# Build app
FROM hseeberger/scala-sbt:11.0.5_1.3.7_2.12.10 as build-app
WORKDIR /build
# The root of the repository is the context
COPY /build.sbt .
COPY /app/benchmark/app ./app/benchmark/app
COPY /app/benchmark/conf ./app/benchmark/conf
COPY /app/kg/app ./app/kg/app
COPY /app/kg/conf ./app/kg/conf
COPY /lib/scala ./lib/scala
COPY /project ./project
RUN sbt playUpdateSecret dist

# Build GUI
FROM node:12 as build-gui
WORKDIR /build
COPY /gui/package.json .
RUN npm install
COPY /gui .
RUN npm run build-kg

# Deployment
FROM ubuntu:18.04

# Install packages
RUN apt-get update && apt-get install -y curl default-jre-headless nginx unzip

# Copy in app
COPY --from=build-app /build/app/kg/target/universal/mcs-kg-app-1.0.0-SNAPSHOT.zip /
RUN unzip -q mcs-kg-app-1.0.0-SNAPSHOT.zip && mv /mcs-kg-app-1.0.0-SNAPSHOT /app && chmod +x /app/bin/mcs-kg-app

# Copy in gui
COPY /nginx.conf /etc/nginx/sites-available/default
COPY --from=build-gui /build/dist/kg /usr/share/nginx/html

# Copy in entrypoint
COPY /app/kg/docker-entrypoint.sh /

EXPOSE 80

WORKDIR /app
RUN mkdir -p /app/data/import/kg/kgtk && mkdir -p /app/data/import/kg/legacy

ENTRYPOINT ["/docker-entrypoint.sh"]
