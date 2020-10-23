package controllers.assets

import controllers.Assets
import io.github.tetherlessworld.mcsapps.lib.kg.controllers.GuiAssetsController
import io.github.tetherlessworld.twxplore.lib.base.controllers.assets.BaseAssetsController
import javax.inject.{Inject, Singleton}

@Singleton
class BenchmarkGuiAssetsController @Inject()(assets: Assets) extends GuiAssetsController(Some("/"), assets)
