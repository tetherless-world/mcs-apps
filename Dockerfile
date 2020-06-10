# Build
FROM hseeberger/scala-sbt:11.0.5_1.3.7_2.12.10 as build
WORKDIR /app
# The root of the repository is the context
COPY /build.sbt .
COPY /app ./app
COPY /conf ./conf
COPY /project ./project
RUN sbt playUpdateSecret dist

# Deployment
FROM ubuntu:18.04

RUN apt-get update && apt-get install -y curl default-jre-headless unzip

COPY --from=build /app/target/universal/mcs-portal-app-1.0.0-SNAPSHOT.zip /
RUN unzip -q mcs-portal-app-1.0.0-SNAPSHOT.zip && mv /mcs-portal-app-1.0.0-SNAPSHOT /app && chmod +x /app/bin/mcs-portal-app

COPY /docker-entrypoint.sh /

EXPOSE 9000

WORKDIR /app
ENTRYPOINT ["/docker-entrypoint.sh"]
