import java.util.UUID

import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.stream.scaladsl.{Flow, GraphDSL, Merge, Sink, Source}
import akka.stream.{ActorMaterializer, FlowShape, OverflowStrategy}

import scala.collection.mutable
import scala.concurrent.ExecutionContextExecutor
import scala.io.StdIn

object WebServer {
  def main(args: Array[String]) {
    implicit val system: ActorSystem = ActorSystem()
    implicit val materializer: ActorMaterializer = ActorMaterializer()
    implicit val executionContext: ExecutionContextExecutor = system.dispatcher

    case class Subscribe(id: String, actorRef: ActorRef)
    case class UnSubscribe(id: String)

    class BroadcastActor extends Actor {
      val subscribers = mutable.HashMap.empty[String, ActorRef]
      var count = 0

      def receive: Receive = {
        case Subscribe(id, actorRef) =>
          subscribers += ((id, actorRef))
          subscribers.values.foreach(_ ! count.toString)
        case UnSubscribe(id) => subscribers -= id
        case _ =>
          count = count + 1
          subscribers.values.foreach(_ ! count.toString)
      }
    }
    val broadcastActor = system.actorOf(Props[BroadcastActor])

    def flow: Flow[Message, TextMessage.Strict, ActorRef] = {
      Flow.fromGraph(GraphDSL.create(Source.actorRef[String](bufferSize = 3, OverflowStrategy.fail)) { implicit builder => subscribeActor =>
        import GraphDSL.Implicits._

        val websocketSource = builder.add(Flow[Message].map {
          case TextMessage.Strict(message) => message.toString
        })
        val uuid = UUID.randomUUID().toString
        val connActorSource = builder.materializedValue.map[Any](Subscribe(uuid, _))
        val merge = builder.add(Merge[Any](2))
        val broadcastActorSink = Sink.actorRef(broadcastActor, UnSubscribe(uuid))

        websocketSource ~> merge ~> broadcastActorSink
        connActorSource ~> merge

        val output = builder.add(Flow[String].map { message: String =>
          TextMessage(message)
        })

        subscribeActor ~> output

        FlowShape(websocketSource.in, output.out)
      })
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
