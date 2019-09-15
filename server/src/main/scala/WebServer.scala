import java.net.InetAddress
import java.util.UUID

import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{BinaryMessage, Message}
import akka.http.scaladsl.server.Directives._
import akka.stream.scaladsl.{Flow, GraphDSL, Merge, Sink, Source}
import akka.stream.{ActorMaterializer, FlowShape, OverflowStrategy}
import akka.util.ByteString
import com.softwaremill.sttp._
import com.softwaremill.sttp.circe._
import io.circe._
import io.circe.generic.auto._
import io.circe.generic.semiauto._
import proto.behavior.Behavior
import proto.contents.Contents

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
        case (behavior: Behavior, contents: Contents) if behavior.behavior == Behavior.Behavior.UPDATE =>
          subscribers.values.foreach(_ ! ((behavior, contents)))
        case (behavior: Behavior, contents: Contents) if behavior.behavior == Behavior.Behavior.SAVE =>
          implicit val backend: SttpBackend[Id, Nothing] = HttpURLConnectionBackend()
          implicit val encoder: Encoder[Contents]        = deriveEncoder[Contents]
          sttp
            .post(uri"http://127.0.0.1:8081/create")
            .body(contents)
            .send()
            .body match {
            case Right(_) => subscribers.values.foreach(_ ! ((behavior, ())))
            case Left(_)  =>
          }
        case behavior: Behavior if behavior.behavior == Behavior.Behavior.LOAD =>
          implicit val backend: SttpBackend[Id, Nothing] = HttpURLConnectionBackend()
          sttp
            .post(uri"http://127.0.0.1:8081/getLatest")
            .response(asJson[Contents])
            .send()
            .body match {
            case Right(r) =>
              r match {
                case Right(contents) =>
                  subscribers.values.foreach(_ ! ((behavior, contents)))
                case Left(_) =>
              }
            case Left(_) =>
          }
        case _ =>
      }
    }
    val broadcastActor = system.actorOf(Props[BroadcastActor])

    def flow: Flow[Message, Message, Any] = {
      Flow.fromGraph(GraphDSL.create(Source.actorRef[(Behavior, Any)](bufferSize = 3, OverflowStrategy.fail)) { implicit builder => subscribeActor =>
        import GraphDSL.Implicits._

        val websocketSource = builder.add(Flow[Message].map {
          case BinaryMessage.Strict(message) =>
            val binaryArray   = message.toArray
            val behaviorSize  = java.lang.Integer.parseInt(binaryArray.take(1)(0).toString, 8)
            val behaviorArray = binaryArray.slice(1, behaviorSize + 1)
            val behavior      = Behavior.parseFrom(behaviorArray)
            behavior.behavior match {
              case Behavior.Behavior.UPDATE =>
                val contentsArray = binaryArray.drop(1 + behaviorSize)
                val contents      = Contents.parseFrom(contentsArray)
                (behavior, contents)
              case Behavior.Behavior.SAVE =>
                val contentsArray = binaryArray.drop(1 + behaviorSize)
                val contents      = Contents.parseFrom(contentsArray)
                (behavior, contents)
              case Behavior.Behavior.LOAD => behavior
              case _                      =>
            }
          case _ =>
        })
        val uuid               = UUID.randomUUID().toString
        val connActorSource    = builder.materializedValue.map[Any](Subscribe(uuid, _))
        val merge              = builder.add(Merge[Any](2))
        val broadcastActorSink = Sink.actorRef(broadcastActor, UnSubscribe(uuid))

        websocketSource ~> merge ~> broadcastActorSink
        connActorSource ~> merge

        val output = builder.add(Flow[(Behavior, Any)].map(data => {
          val behavior         = data._1
          val behaviorSizeByte = behavior.toByteArray.length.toByte
          behavior.behavior match {
            case Behavior.Behavior.UPDATE =>
              val contents  = data._2.asInstanceOf[Contents]
              val byteArray = Array(behaviorSizeByte) ++ behavior.toByteArray ++ contents.toByteArray
              BinaryMessage(ByteString(byteArray))
            case Behavior.Behavior.SAVE =>
              val byteArray = Array(behaviorSizeByte) ++ behavior.toByteArray
              BinaryMessage(ByteString(byteArray))
            case Behavior.Behavior.LOAD =>
              val contents  = data._2.asInstanceOf[Contents]
              val byteArray = Array(behaviorSizeByte) ++ behavior.toByteArray ++ contents.toByteArray
              BinaryMessage(ByteString(byteArray))
            case _ => BinaryMessage(ByteString())
          }
        }))

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
    val host          = "0.0.0.0"
    val port          = 8080
    val bindingFuture = Http().bindAndHandle(route, host, port)

    println(s"Server online at http://${InetAddress.getLocalHost.getHostAddress}:$port/\nPress RETURN to stop...")
    StdIn.readLine()
    bindingFuture
      .flatMap(_.unbind())
      .onComplete(_ => system.terminate())
  }
}
