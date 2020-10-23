package io.github.tetherlessworld.mcsapps.lib.kg.controllers

import controllers.Assets
import org.slf4j.LoggerFactory
import play.api.mvc.{Action, AnyContent, InjectedController}

abstract class GuiAssetsController(baseHref: Option[String], assets: Assets) extends InjectedController {
  private val logger = LoggerFactory.getLogger(classOf[GuiAssetsController])
  private val baseHrefPrivate = baseHref.getOrElse(GuiAssetsController.BaseHrefDefault)
  logger.info("using base href {}", baseHrefPrivate)

  if (!baseHrefPrivate.startsWith("/")) {
    throw new IllegalArgumentException("base href must start with /")
  }

  final def frontEndPath(path: String): Action[AnyContent] = {
    val fullPath = "/" + path // The leading / is stripped by the router, restore it here
    if (fullPath.startsWith(baseHrefPrivate)) {
      val relativePath = fullPath.substring(baseHrefPrivate.length)
      logger.debug("resolved path {} to relative {}", fullPath.asInstanceOf[Any], relativePath.asInstanceOf[Any])

      // If the path has a file extension, assume it's a file and not a React URL
      // This is simpler than more complicated code that tests if the file exists, which didn't work for both dev (public/ file system) and production (assets.jar) cases.
      if (path.endsWith(".css") || path.endsWith(".html") || path.endsWith(".ico") || path.endsWith(".js")) {
        assets.at("/public", relativePath, aggressiveCaching = false)
      } else {
        assets.at("/public", "index.html", aggressiveCaching = false)
      }
    } else {
      Action {
        NotFound
      }
    }
  }
}

object GuiAssetsController {
  val BaseHrefDefault = "/"
}
