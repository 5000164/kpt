package interfaces

import myproto.item.Item
import org.scalajs.dom

import scala.scalajs.js
import scala.scalajs.js.typedarray

object Application {
  def main(args: Array[String]): Unit = {
    val self = js.Dynamic.global
    val socket = new dom.WebSocket("ws://127.0.0.1:8080/connect")
    socket.binaryType = "arraybuffer"

    self.onmessage = (input: dom.MessageEvent) => {
      val item = Item(input.data.toString)
      socket.send(typedarray.byteArray2Int8Array(item.toByteArray).buffer)
    }

    socket.onmessage = { e: dom.MessageEvent =>
      self.postMessage(e.data.toString)
    }
  }
}
