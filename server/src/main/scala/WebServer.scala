import akka.NotUsed
import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.Flow

import scala.concurrent.ExecutionContextExecutor
import scala.io.StdIn

object WebServer {
  def main(args: Array[String]) {
    implicit val system: ActorSystem = ActorSystem()
    implicit val materializer: ActorMaterializer = ActorMaterializer()
    implicit val executionContext: ExecutionContextExecutor = system.dispatcher

    def flow: Flow[Message, TextMessage.Strict, NotUsed] = Flow[Message].map {
      case TextMessage.Strict(_) => TextMessage(scala.util.Random.alphanumeric.take(10).mkString)
    }

    val route =
      pathEndOrSingleSlash {
        getFromFile("client/src/main/resources/build/index.html")
      } ~
        pathPrefix("") {
          getFromDirectory("client/src/main/resources/build")
        } ~
        path("connect") {
          handleWebSocketMessages(flow)
        }

    val bindingFuture = Http().bindAndHandle(route, "localhost", 8080)

    println(s"Server online at http://127.0.0.1:8080/\nPress RETURN to stop...")
    StdIn.readLine()
    bindingFuture
      .flatMap(_.unbind())
      .onComplete(_ => system.terminate())
  }
}
