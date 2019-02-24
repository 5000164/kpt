package tutorial.webapp

import com.softwaremill.sttp._
import org.scalajs.dom

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.scalajs.js
import scala.util.{Failure, Success}

object TutorialApp {
  def main(args: Array[String]): Unit = {
    implicit val sttpBackend: SttpBackend[Future, Nothing] = FetchBackend()

    val self = js.Dynamic.global
    self.onmessage = (_: dom.MessageEvent) => {
      sttp.post(uri"http://127.0.0.1:8080/api/get_random_string").send() onComplete {
        case Success(response) =>
          response.body match {
            case Right(result) => self.postMessage(result)
            case Left(_) =>
          }
        case Failure(_) =>
      }
    }
  }
}
