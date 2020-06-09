package controllers.import_

import java.nio.file.Paths

import controllers.Assets
import javax.inject.{Inject, Singleton}
import play.api.Configuration
import play.api.http.HttpEntity
import play.api.mvc.InjectedController
import stores.{CskgEdgesCsvReader, CskgNodesCsvReader, Store}

@Singleton
class ImportController @Inject()(configuration: Configuration, store: Store) extends InjectedController {
  private val importDirectoryPath = Paths.get(configuration.get[String]("importDirectoryPath"))

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
}
