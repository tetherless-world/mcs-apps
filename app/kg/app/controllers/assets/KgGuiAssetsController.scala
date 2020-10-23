package controllers.assets

import controllers.Assets
import io.github.tetherlessworld.mcsapps.lib.kg.controllers.GuiAssetsController
import io.github.tetherlessworld.twxplore.lib.base.controllers.assets.BaseAssetsController
import javax.inject.{Inject, Singleton}
import play.api.Configuration

@Singleton
class KgGuiAssetsController @Inject()(configuration: Configuration, assets: Assets) extends GuiAssetsController(configuration.getOptional[String]("kgBaseHref"), assets)
