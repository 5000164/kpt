package interfaces

import org.scalajs.dom
import proto.behavior.Behavior
import proto.contents.Contents

import scala.scalajs.js

object Application {
  def main(args: Array[String]): Unit = {
    val self   = js.Dynamic.global
    val socket = new dom.WebSocket(s"ws://${self.location.hostname}:8080/connect")
    socket.binaryType = "arraybuffer"

    self.onmessage = (event: dom.MessageEvent) => {
      val behavior              = Behavior.parseFrom(js.typedarray.int8Array2ByteArray(new js.typedarray.Int8Array(event.data.asInstanceOf[Receiver].behavior)))
      val behaviorInt8Array     = js.typedarray.byteArray2Int8Array(behavior.toByteArray)
      val behaviorSizeInt8Array = new js.typedarray.Int8Array(1)
      behaviorSizeInt8Array(0) = behaviorInt8Array.byteLength.toOctalString.toByte
      behavior.behavior match {
        case Behavior.Behavior.UPDATE =>
          val contents =
            Contents.parseFrom(js.typedarray.int8Array2ByteArray(new js.typedarray.Int8Array(event.data.asInstanceOf[Receiver].data)))
          val contentsInt8Array = js.typedarray.byteArray2Int8Array(contents.toByteArray)

          val data = new js.typedarray.Int8Array(behaviorSizeInt8Array.byteLength + behaviorInt8Array.byteLength + contentsInt8Array.byteLength)
          var i    = 0
          behaviorSizeInt8Array.foreach(d => {
            data(i) = d
            i = i + 1
          })
          behaviorInt8Array.foreach(d => {
            data(i) = d
            i = i + 1
          })
          contentsInt8Array.foreach(d => {
            data(i) = d
            i = i + 1
          })
          socket.send(data.buffer)
        case _ =>
      }
    }

    socket.onmessage = { e: dom.MessageEvent =>
      e.data match {
        case buf: js.typedarray.ArrayBuffer =>
          val behaviorSizeInt8Array = new js.typedarray.Int8Array(buf.slice(0, 1))
          val behaviorSize          = java.lang.Integer.parseInt(behaviorSizeInt8Array(0).toString, 8)
          val behaviorInt8Array     = new js.typedarray.Int8Array(buf.slice(1, behaviorSize + 1))
          val behavior              = Behavior.parseFrom(js.typedarray.int8Array2ByteArray(behaviorInt8Array))
          behavior.behavior match {
            case Behavior.Behavior.UPDATE =>
              val contentsInt8Array = new js.typedarray.Int8Array(buf.slice(behaviorSize + 1, buf.byteLength))
              val sendBehavior      = new js.typedarray.Uint8Array(behaviorInt8Array)
              val sendData          = new js.typedarray.Uint8Array(contentsInt8Array)
              self.postMessage(js.Array(sendBehavior, sendData), js.Array(sendBehavior.buffer, sendData.buffer))
            case _ =>
          }
        case _ =>
      }
    }

    socket.onclose = { _: dom.CloseEvent =>
      println("The connection has been closed.")
    }
  }
}

@js.native
trait Receiver extends js.Object {
  val behavior: js.typedarray.Uint8Array = js.native
  val data: js.typedarray.Uint8Array     = js.native
}
