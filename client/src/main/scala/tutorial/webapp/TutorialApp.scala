package tutorial.webapp

import org.scalajs.dom

import scala.scalajs.js

object TutorialApp {
  def main(args: Array[String]): Unit = {
    val self = js.Dynamic.global
    self.onmessage = (e: dom.MessageEvent) => {
      self.postMessage(e.data.toString.dropRight(1))
    }
  }
}
