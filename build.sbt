import sbt.Resolver

val twxploreVersion = "1.0.0-SNAPSHOT"

resolvers in ThisBuild += Resolver.sonatypeRepo("snapshots")

lazy val app = (project in file("."))
  .enablePlugins(PlayScala)
  .settings(
    libraryDependencies ++= Seq(
      "com.github.tototoshi" %% "scala-csv" % "1.3.6",
      // Implement search in the MemStore (and thus the TestStore)
      "com.outr" %% "lucene4s" % "1.9.1",
      "io.github.tetherless-world" %% "twxplore-base" % twxploreVersion,
      "io.github.tetherless-world" %% "twxplore-test" % twxploreVersion % Test,
      "me.tongfei" % "progressbar" % "0.8.1",
      "org.neo4j.driver" % "neo4j-java-driver" % "4.0.1"
    ),
    maintainer := "gordom6@rpi.edu",
    name := "mcs-portal-app",
    scalaVersion := "2.12.10",
    version := "1.0.0-SNAPSHOT"
  )
