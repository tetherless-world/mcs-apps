package controllers.`import`

import java.io.File
import java.nio.file.{Files, Path}

import controllers.import_.KgImportController
import data.kg.{TestCskgCsvData, TestCskgCsvDataResources, TestKgtkData, TestKgtkDataResources}
import org.scalatest.BeforeAndAfterEach
import org.scalatestplus.play.PlaySpec
import play.api.mvc.Results
import play.api.test.{FakeRequest, Helpers}
import stores.kg.{KgStore, MemKgStore}

import scala.reflect.io.Directory

class KgImportControllerSpec extends PlaySpec with BeforeAndAfterEach with Results {
  private var sut: KgImportController = _
  private var importDirectoryPath: Path = _
  private var store: KgStore = _

  override protected def afterEach(): Unit = {
    new Directory(importDirectoryPath.toFile).deleteRecursively()
  }

  override protected def beforeEach(): Unit = {
    importDirectoryPath = Files.createTempDirectory(null)
    val kgImportDirectory = importDirectoryPath.resolve("kg")
    Files.createDirectory(kgImportDirectory)
    Files.createDirectory(kgImportDirectory.resolve("kgtk"))
    Files.createDirectory(kgImportDirectory.resolve("legacy"))
    store = new MemKgStore
    sut = new KgImportController(importDirectoryPath, store)
    sut.setControllerComponents(Helpers.stubControllerComponents())
  }

  "The import controller" should {
//    "clear the store" in {
//      store.putNodes(KgTestData.nodes.iterator)
//      store.isEmpty must be(false)
//      val result = sut.clear()(FakeRequest())
////      val bodyText = contentAsString(result)
//////      bodyText must be("ok")
//      store.isEmpty must be(true)
//    }

    "put KGTK edges TSV to the store" in {
      store.getTotalEdgesCount must be (0)
      val sourceFilePath = new File(getClass.getResource(TestKgtkDataResources.edgesTsvBz2.name).toURI).toPath
      val destFilePath = importDirectoryPath.resolve("kg").resolve("kgtk").resolve(sourceFilePath.getFileName)
      Files.copy(sourceFilePath, destFilePath)
      val result = sut.putKgtkEdgesTsv(destFilePath.getFileName.toString)(FakeRequest())
      //      val bodyText = contentAsString(result)
      //      //      bodyText must be("ok")
      store.getTotalEdgesCount must be (TestKgtkData.edges.length)
    }

    "put legacy edges CSV to the store" in {
      store.getTotalEdgesCount must be (0)
      store.putNodes(TestCskgCsvData.nodes.iterator)
      val sourceFilePath = new File(getClass.getResource(TestCskgCsvDataResources.edgesCsvBz2.name).toURI).toPath
      val destFilePath = importDirectoryPath.resolve("kg").resolve("legacy").resolve(sourceFilePath.getFileName)
      Files.copy(sourceFilePath, destFilePath)
      val result = sut.putLegacyEdgesCsv(destFilePath.getFileName.toString)(FakeRequest())
      //      val bodyText = contentAsString(result)
      //      //      bodyText must be("ok")
      store.getTotalEdgesCount must be (TestCskgCsvData.edges.length)
    }

    "put legacy nodes CSV to the store" in {
      store.getTotalNodesCount must be (0)
      val sourceFilePath = new File(getClass.getResource(TestCskgCsvDataResources.nodesCsvBz2.name).toURI).toPath
      val destFilePath = importDirectoryPath.resolve("kg").resolve("legacy").resolve(sourceFilePath.getFileName)
      Files.copy(sourceFilePath, destFilePath)
      val result = sut.putLegacyNodesCsv(destFilePath.getFileName.toString)(FakeRequest())
//      val bodyText = contentAsString(result)
//      //      bodyText must be("ok")
      store.getTotalNodesCount must be (TestCskgCsvData.nodes.length)
    }

    //    "put paths to the store" in {
    ////      store.getPaths.length must be (0)
    //      val sourceFilePath = new File(getClass.getResource(TestKgDataResources.pathsJsonlResourceName).toURI).toPath
    //      val destFilePath = importDirectoryPath.resolve("kg").resolve(sourceFilePath.getFileName)
    //      Files.copy(sourceFilePath, destFilePath)
    //      val result = sut.putPaths(destFilePath.getFileName.toString)(FakeRequest())
    //      //      val bodyText = contentAsString(result)
    //      //      //      bodyText must be("ok")
    ////      store.getPaths.length must be (TestKgData.paths.length)
    //    }
  }

}
