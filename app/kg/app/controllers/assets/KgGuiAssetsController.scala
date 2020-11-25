package controllers.assets

import controllers.Assets
import io.github.tetherlessworld.mcsapps.lib.kg.controllers.GuiAssetsController
import javax.inject.{Inject, Singleton}
import play.api.Configuration

@Singleton
class KgGuiAssetsController @Inject()(assets: Assets, configuration: Configuration) extends GuiAssetsController(assets, configuration)
