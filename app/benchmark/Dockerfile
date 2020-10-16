# Build GUI
FROM node:12 as build-gui
WORKDIR /build
COPY /gui/package.json .
RUN npm install
COPY /gui .
RUN npm run build-benchmark

# Build app
FROM hseeberger/scala-sbt:11.0.5_1.3.7_2.12.10 as build-app
WORKDIR /build
# The root of the repository is the context
COPY /build.sbt .
COPY /app/benchmark/app ./app/benchmark/app
COPY /app/benchmark/conf ./app/benchmark/conf
COPY /lib/scala ./lib/scala
COPY /project ./project
COPY --from=build-gui /build/dist/benchmark ./app/benchmark/public
RUN find .
RUN sbt "project benchmarkApp" playUpdateSecret dist

# Deployment
FROM ubuntu:18.04

# Install packages
RUN apt-get update && apt-get install -y curl default-jre-headless unzip

# Copy in app
COPY --from=build-app /build/app/benchmark/target/universal/mcs-benchmark-app-1.0.0-SNAPSHOT.zip /
RUN unzip -q mcs-benchmark-app-1.0.0-SNAPSHOT.zip && mv /mcs-benchmark-app-1.0.0-SNAPSHOT /app && chmod +x /app/bin/mcs-benchmark-app

# Copy in entrypoint
COPY /app/benchmark/docker-entrypoint.sh /

EXPOSE 80

WORKDIR /app

ENTRYPOINT ["/docker-entrypoint.sh"]
