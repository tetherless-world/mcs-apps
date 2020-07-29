import sbt.Resolver

val maintainerValue = "gordom6@rpi.edu"
val twxploreVersion = "1.0.0-SNAPSHOT"

resolvers in ThisBuild += Resolver.sonatypeRepo("snapshots")
scalaVersion in ThisBuild := "2.12.10"
version in ThisBuild := "1.0.0-SNAPSHOT"


lazy val kgApp = (project in file("app/kg"))
  .dependsOn(benchmarkLib, kgLib)
  .enablePlugins(PlayScala)
  .settings(
    libraryDependencies ++= Seq(
      "io.github.tetherless-world" %% "twxplore-test" % twxploreVersion % Test
    ),
    maintainer := maintainerValue,
    name := "mcs-kg-app",
  )

lazy val benchmarkApp = (project in file("app/benchmark"))
  .dependsOn(benchmarkLib, kgLib)
  .enablePlugins(PlayScala)
  .settings(
    libraryDependencies ++= Seq(
      "io.github.tetherless-world" %% "twxplore-test" % twxploreVersion % Test
    ),
    maintainer := maintainerValue,
    name := "mcs-benchmark-app",
  )

lazy val benchmarkLib =
  (project in file("lib/scala/benchmark"))
    .dependsOn(kgLib)
    .settings(
      libraryDependencies ++= Seq(
        "io.github.tetherless-world" %% "twxplore-test" % twxploreVersion % Test,
      ),
      maintainer := maintainerValue,
      name := "mcs-benchmark-lib"
    )

lazy val kgLib =
  (project in file("lib/scala/kg"))
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
      maintainer := maintainerValue,
      name := "mcs-kg-lib"
    )
