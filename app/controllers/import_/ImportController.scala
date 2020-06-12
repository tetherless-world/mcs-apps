package controllers.import_

import java.nio.file.Paths

import akka.stream.OverflowStrategy
import controllers.Assets
import formats.kg.cskg.{CskgEdgesCsvReader, CskgNodesCsvReader}
import formats.kg.path.PathJsonlReader
import javax.inject.{Inject, Singleton}
import play.api.Configuration
import play.api.http.HttpEntity
import play.api.mvc.InjectedController
import stores.WithResource
import stores.kg.KgStore

import scala.io.Source

@Singleton
class ImportController(importDirectoryPath: java.nio.file.Path, store: KgStore) extends InjectedController with WithResource {
  @Inject
  def this(configuration: Configuration, store: KgStore) =
    this(Paths.get(configuration.get[String]("importDirectoryPath")), store)

  def clear() = Action {
    store.clear()
    Ok("")
  }

  def putEdges(edgesCsvFileName: String) = Action {
    withResource(CskgEdgesCsvReader.open(importDirectoryPath.resolve(edgesCsvFileName))) { reader =>
      store.putEdges(reader.toStream)
      Ok("")
    }
  }

  def putNodes(nodesCsvFileName: String) = Action {
    withResource(CskgNodesCsvReader.open(importDirectoryPath.resolve(nodesCsvFileName))) { reader =>
      store.putNodes(reader.toStream)
      Ok("")
    }
  }

  def putPaths(pathsJsonlFileName: String) = Action {
    withResource(new PathJsonlReader(Source.fromFile(importDirectoryPath.resolve(pathsJsonlFileName).toFile))) { reader =>
      store.putPaths(reader.toStream)
      Ok("")
    }
  }
}
