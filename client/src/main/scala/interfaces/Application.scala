package interfaces

import org.scalajs.dom

import scala.scalajs.js

object Application {
  def main(args: Array[String]): Unit = {
    val self = js.Dynamic.global
    val socket = new dom.WebSocket("ws://127.0.0.1:8080/connect")

    self.onmessage = (_: dom.MessageEvent) => {
      socket.send("")
    }

    socket.onmessage = { e: dom.MessageEvent =>
      self.postMessage(e.data.toString)
    }
  }
}
