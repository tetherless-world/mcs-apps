package controllers.test

import controllers.{Assets, AssetsFinder}
import io.github.tetherlessworld.twxplore.lib.base.controllers.test.BaseTestController
import javax.inject.{Inject, Singleton}
import play.api.Environment
import play.api.mvc.InjectedController

@Singleton
class BenchmarkTestController @Inject()(assets: Assets) extends BaseTestController(assets)
