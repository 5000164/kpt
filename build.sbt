import sbtcrossproject.CrossPlugin.autoImport.{CrossType, crossProject}

ThisBuild / organization := "jp.5000164"
ThisBuild / scalaVersion := "2.12.8"
ThisBuild / version := "1.0.1"

lazy val proto = crossProject(JVMPlatform, JSPlatform)
  .crossType(CrossType.Pure)
  .settings(
    PB.targets in Compile := Seq(
      scalapb.gen(grpc = false) -> (sourceManaged in Compile).value
    ),
    PB.protoSources in Compile := Seq(file("proto/src/main/protobuf")),
    libraryDependencies ++= Seq(
      "com.thesamet.scalapb" %%% "scalapb-runtime" % scalapb.compiler.Version.scalapbVersion
    )
  )

lazy val protoJVM = proto.jvm
lazy val protoJS  = proto.js

lazy val server = project
  .settings(
    name := "server",
    libraryDependencies ++= Seq(
      "com.typesafe.akka"     %% "akka-http"   % "10.1.7",
      "com.typesafe.akka"     %% "akka-stream" % "2.5.21",
      "com.softwaremill.sttp" %% "core"        % "1.6.0",
      "com.softwaremill.sttp" %% "circe"       % "1.6.0",
      "io.circe"              %% "circe-core"    % "0.10.0",
      "io.circe"              %% "circe-generic" % "0.10.0",
      "io.circe"              %% "circe-parser"  % "0.10.0"
    ),
    scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked", "-Xlint")
  )
  .dependsOn(protoJVM)

lazy val client = project
  .enablePlugins(ScalaJSPlugin)
  .settings(
    name := "client",
    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "0.9.7"
    ),
    excludeFilter in unmanagedResources := ((Compile / baseDirectory).value / "src" / "main" / "resources").getName,
    Compile / fastOptJS / artifactPath := (Compile / fastOptJS / target).value / ".." / "src" / "main" / "resources" / "public" / "worker.js",
    Compile / fullOptJS / artifactPath := (Compile / fullOptJS / target).value / ".." / "src" / "main" / "resources" / "public" / "worker.js",
    Compile / packageJSDependencies / artifactPath := (Compile / packageJSDependencies / target).value / ".." / "src" / "main" / "resources" / "public" / "worker.js",
    Compile / packageMinifiedJSDependencies / artifactPath := (Compile / packageMinifiedJSDependencies / target).value / ".." / "src" / "main" / "resources" / "public" / "worker.js",
    scalaJSUseMainModuleInitializer := true
  )
  .dependsOn(protoJS)
