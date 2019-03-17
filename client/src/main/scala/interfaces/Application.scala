package interfaces

import myproto.item.Item
import org.scalajs.dom

import scala.scalajs.js

object Application {
  def main(args: Array[String]): Unit = {
    val self = js.Dynamic.global
    val socket = new dom.WebSocket("ws://127.0.0.1:8080/connect")
    socket.binaryType = "arraybuffer"

    self.onmessage = (input: dom.MessageEvent) => {
      val item = Item(input.data.toString)
      socket.send(js.typedarray.byteArray2Int8Array(item.toByteArray).buffer)
    }

    socket.onmessage = { e: dom.MessageEvent =>
      val item = e.data match {
        case buf: js.typedarray.ArrayBuffer => Item.parseFrom(js.typedarray.int8Array2ByteArray(new js.typedarray.Int8Array(buf)))
      }
      self.postMessage(item.content)
    }
  }
}
