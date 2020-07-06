# Build
FROM hseeberger/scala-sbt:11.0.5_1.3.7_2.12.10 as build
WORKDIR /build
# The root of the repository is the context
COPY /build.sbt .
COPY /app/kg/app ./app/kg/app
COPY /app/kg/conf ./app/kg/conf
COPY /lib/scala ./lib/scala
COPY /project ./project
RUN sbt playUpdateSecret dist

# Deployment
FROM ubuntu:18.04

RUN apt-get update && apt-get install -y curl default-jre-headless unzip

COPY --from=build /build/app/kg/target/universal/mcs-portal-kg-app-1.0.0-SNAPSHOT.zip /
RUN unzip -q mcs-portal-kg-app-1.0.0-SNAPSHOT.zip && mv /mcs-portal-kg-app-1.0.0-SNAPSHOT /app && chmod +x /app/bin/mcs-portal-kg-app

COPY /docker-entrypoint.sh /

EXPOSE 9000

WORKDIR /app
RUN mkdir -p data/import/kg

ENTRYPOINT ["/docker-entrypoint.sh"]
