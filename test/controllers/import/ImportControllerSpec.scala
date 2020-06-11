package controllers.`import`

import java.nio.file.{Files, Path}

import controllers.import_.ImportController
import org.scalatest.BeforeAndAfterEach
import org.scalatestplus.play.PlaySpec
import play.api.mvc.{AnyContent, Results}
import play.api.test.{FakeRequest, Helpers}
import play.api.test._
import play.api.test.Helpers._
import stores.{MemStore, Store, TestData, TestStore}

import scala.reflect.io.Directory

class ImportControllerSpec extends PlaySpec with BeforeAndAfterEach with Results {
  private var sut: ImportController = _
  private var importDirectoryPath: Path = _
  private var store: Store = _

  override protected def afterEach(): Unit = {
    new Directory(importDirectoryPath.toFile).deleteRecursively()
  }

  override protected def beforeEach(): Unit = {
    importDirectoryPath = Files.createTempDirectory(null)
    store = new MemStore
    sut = new ImportController(importDirectoryPath, store)
    sut.setControllerComponents(Helpers.stubControllerComponents())
  }

  "The import controller" should {
    "clear the store" in {
      store.putNodes(TestData.nodes)
      store.isEmpty must be(false)
      val result = sut.clear()(FakeRequest())
      val bodyText = contentAsString(result)
//      bodyText must be("ok")
      store.isEmpty must be(true)
    }
  }

}
