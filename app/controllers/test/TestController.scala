package controllers.test

import controllers.{Assets, AssetsFinder}
import javax.inject.{Inject, Singleton}
import play.api.Environment
import play.api.mvc.InjectedController
import stores.kg.TestKgStore

@Singleton
class TestController @Inject()(assets: Assets) extends InjectedController {
  def frontEndPath(path: String) = {
    if (path.endsWith(".css") || path.endsWith(".html") || path.endsWith(".ico") || path.endsWith(".js")) {
      // If the path has a file extension, assume it's a file and not a React URL
      // This is simpler than more complicated code that tests if the file exists, which didn't work for both dev (public/ file system) and production (assets.jar) cases.
      assets.at("/public", path, aggressiveCaching = false)
    } else {
      assets.at("/public", "index.html", aggressiveCaching = false)
    }
  }
}
