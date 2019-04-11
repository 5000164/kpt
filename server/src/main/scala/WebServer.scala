import java.util.UUID

import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{BinaryMessage, Message}
import akka.http.scaladsl.server.Directives._
import akka.stream.scaladsl.{Flow, GraphDSL, Merge, Sink, Source}
import akka.stream.{ActorMaterializer, FlowShape, OverflowStrategy}
import akka.util.ByteString
import proto.server.item.Item

import scala.collection.mutable
import scala.concurrent.ExecutionContextExecutor
import scala.io.StdIn

object WebServer {
  def main(args: Array[String]) {
    implicit val system: ActorSystem                        = ActorSystem()
    implicit val materializer: ActorMaterializer            = ActorMaterializer()
    implicit val executionContext: ExecutionContextExecutor = system.dispatcher

    case class Subscribe(id: String, actorRef: ActorRef)
    case class UnSubscribe(id: String)

    class BroadcastActor extends Actor {
      val subscribers = mutable.HashMap.empty[String, ActorRef]

      def receive: Receive = {
        case Subscribe(id, actorRef) => subscribers += ((id, actorRef))
        case UnSubscribe(id)         => subscribers -= id
        case item: Item              => subscribers.values.foreach(_ ! item)
      }
    }
    val broadcastActor = system.actorOf(Props[BroadcastActor])

    def flow: Flow[Message, Message, Any] = {
      Flow.fromGraph(GraphDSL.create(Source.actorRef[Item](bufferSize = 3, OverflowStrategy.fail)) { implicit builder => subscribeActor =>
        import GraphDSL.Implicits._

        val websocketSource = builder.add(Flow[Message].map {
          case BinaryMessage.Strict(message) => Item.parseFrom(message.toArray)
        })
        val uuid               = UUID.randomUUID().toString
        val connActorSource    = builder.materializedValue.map[Any](Subscribe(uuid, _))
        val merge              = builder.add(Merge[Any](2))
        val broadcastActorSink = Sink.actorRef(broadcastActor, UnSubscribe(uuid))

        websocketSource ~> merge ~> broadcastActorSink
        connActorSource ~> merge

        val output = builder.add(Flow[Item].map(item => BinaryMessage(ByteString(item.toByteArray))))

        subscribeActor ~> output

        FlowShape(websocketSource.in, output.out)
      })
    }

    val route =
      pathEndOrSingleSlash {
        getFromResource("build/index.html")
      } ~
        pathPrefix("") {
          getFromResourceDirectory("build")
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
