addSbtPlugin("com.thesamet" % "sbt-protoc" % "0.99.19" exclude ("com.thesamet.scalapb", "protoc-bridge_2.10"))

libraryDependencies += "com.thesamet.scalapb" %% "compilerplugin-shaded" % "0.8.2"
