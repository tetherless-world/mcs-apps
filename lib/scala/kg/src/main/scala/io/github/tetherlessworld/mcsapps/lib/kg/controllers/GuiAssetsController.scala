package io.github.tetherlessworld.mcsapps.lib.kg.controllers

import controllers.Assets
import play.api.Configuration
import play.api.mvc.{Action, AnyContent, InjectedController}

abstract class GuiAssetsController(assets: Assets, configuration: Configuration) extends InjectedController {
  final def frontEndPath(path: String): Action[AnyContent] = {
    // If the path has a file extension, assume it's a file and not a React URL
    // This is simpler than more complicated code that tests if the file exists, which didn't work for both dev (public/ file system) and production (assets.jar) cases.
    if (path.endsWith(".css") || path.endsWith(".html") || path.endsWith(".ico") || path.endsWith(".js")) {
      assets.at("/public", path, aggressiveCaching = false)
    } else {
      assets.at("/public", "index.html", aggressiveCaching = false)
    }
  }
}
