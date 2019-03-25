package interfaces

import client.groups.Groups
import myproto.item.Item
import org.scalajs.dom

import scala.scalajs.js

object Application {
  def main(args: Array[String]): Unit = {
    val self = js.Dynamic.global
    val socket = new dom.WebSocket("ws://127.0.0.1:8080/connect")
    socket.binaryType = "arraybuffer"

    self.onmessage = (event: dom.MessageEvent) => {
      val data = event.data.asInstanceOf[js.typedarray.Uint8Array]
      // To use int8Array2ByteArray function.
      // I think that probably Protocol Buffers doesn't care about defined or undefined.
      // (Probably) An important thing is a binary array.
      val intData = new js.typedarray.Int8Array(data)
      val groups = Groups.parseFrom(js.typedarray.int8Array2ByteArray(intData))
      val item = Item(groups.content)
      socket.send(js.typedarray.byteArray2Int8Array(item.toByteArray).buffer)
    }

    socket.onmessage = { e: dom.MessageEvent =>
      val item = e.data match {
        case buf: js.typedarray.ArrayBuffer => Item.parseFrom(js.typedarray.int8Array2ByteArray(new js.typedarray.Int8Array(buf)))
      }
      val groups = Groups(item.content)
      val intData = js.typedarray.byteArray2Int8Array(groups.toByteArray)
      val data = new js.typedarray.Uint8Array(intData)
      self.postMessage(data, js.Array(data.buffer))
    }
  }
}
