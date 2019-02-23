val akkaHttp = "com.typesafe.akka"   %% "akka-http"   % "10.1.7"
val akkaStream = "com.typesafe.akka" %% "akka-stream" % "2.5.21"

ThisBuild / organization := "jp.5000164"
ThisBuild / scalaVersion := "2.12.8"
ThisBuild / version := "0.1.0-SNAPSHOT"

lazy val commonSettings = Seq(
  scalaVersion := "2.12.8",
  scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked", "-Xlint")
)

lazy val common = project
  .settings(
    name := "common",
    commonSettings
  )

lazy val server = project
  .settings(
    name := "server",
    commonSettings,
    libraryDependencies ++= Seq(
      akkaHttp,
      akkaStream
    )
  )
  .dependsOn(common)

lazy val client = project
  .enablePlugins(ScalaJSPlugin)
  .settings(
    name := "client",
    commonSettings,
    scalaJSUseMainModuleInitializer := true
  )
  .dependsOn(common)
