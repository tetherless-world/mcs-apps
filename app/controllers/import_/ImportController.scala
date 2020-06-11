package controllers.import_

import java.nio.file.Paths

import controllers.Assets
import formats.cskg.{CskgEdgesCsvReader, CskgNodesCsvReader}
import formats.path.PathJsonlReader
import javax.inject.{Inject, Singleton}
import play.api.Configuration
import play.api.http.HttpEntity
import play.api.mvc.InjectedController
import stores.Store

@Singleton
class ImportController @Inject()(importDirectoryPath: java.nio.file.Path, store: Store) extends InjectedController {
  @Inject
  def this(configuration: Configuration, store: Store) =
    this(Paths.get(configuration.get[String]("importDirectoryPath")), store)

  def clear() = Action {
    store.clear()
    Ok("")
  }

  def putEdges(edgesCsvFileName: String) = Action {
    val edges = new CskgEdgesCsvReader().read(importDirectoryPath.resolve(edgesCsvFileName))
    store.putEdges(edges)
    Ok("")
  }

  def putNodes(nodesCsvFileName: String) = Action {
    val nodes = new CskgNodesCsvReader().read(importDirectoryPath.resolve(nodesCsvFileName))
    store.putNodes(nodes)
    Ok("")
  }

  def putPaths(pathsJsonlFileName: String) = Action {
    val paths = new PathJsonlReader().read(importDirectoryPath.resolve(pathsJsonlFileName))
    store.putPaths(paths)
    Ok("")
  }
}
