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
        // Implement search in the MemStore (and thus the TestStore)
        "com.github.tminglei" %% "slick-pg" % "0.19.3",
        "com.outr" %% "lucene4s" % "1.9.1",
        "com.typesafe.slick" %% "slick" % "3.3.3",
        "com.typesafe.slick" %% "slick-hikaricp" % "3.3.3",
        "io.github.tetherless-world" %% "twxplore-base" % twxploreVersion,
        "io.github.tetherless-world" %% "twxplore-test" % twxploreVersion % Test,
        "me.tongfei" % "progressbar" % "0.8.1",
        "org.neo4j.driver" % "neo4j-java-driver" % "4.0.1",
        "org.postgresql" % "postgresql" % "42.2.18"
      ),
      maintainer := maintainerValue,
      name := "mcs-kg-lib"
    )
