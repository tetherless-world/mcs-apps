package controllers.import_

import java.nio.file.Paths

import akka.stream.OverflowStrategy
import controllers.Assets
import formats.kg.cskg.{CskgEdgesCsvReader, CskgNodesCsvReader}
import formats.kg.path.KgPathsJsonlReader
import javax.inject.{Inject, Singleton}
import me.tongfei.progressbar.{DelegatingProgressBarConsumer, ProgressBar, ProgressBarBuilder}
import org.slf4j.LoggerFactory
import play.api.Configuration
import play.api.http.HttpEntity
import play.api.mvc.InjectedController
import stores.WithResource
import stores.kg.KgStore

import scala.io.Source

@Singleton
class ImportController(importDirectoryPath: java.nio.file.Path, store: KgStore) extends InjectedController with WithResource {
  private val logger = LoggerFactory.getLogger(getClass)

  @Inject
  def this(configuration: Configuration, store: KgStore) =
    this(Paths.get(configuration.get[String]("importDirectoryPath")), store)

  def clear() = Action {
    store.clear()
    Ok("")
  }

  def putEdges(edgesCsvFileName: String) = Action {
    withResource(CskgEdgesCsvReader.open(importDirectoryPath.resolve("kg").resolve(edgesCsvFileName))) { reader =>
      withStreamProgress(reader.toStream, "putEdges") { edges =>
        store.putEdges(edges)
        Ok("")
      }
    }
  }

  def putNodes(nodesCsvFileName: String) = Action {
    withResource(CskgNodesCsvReader.open(importDirectoryPath.resolve("kg").resolve(nodesCsvFileName))) { reader =>
      withStreamProgress(reader.toStream, "putNodes") { nodes =>
        store.putNodes(nodes)
        Ok("")
      }
    }
  }

  def putPaths(pathsJsonlFileName: String) = Action {
    withResource(new KgPathsJsonlReader(Source.fromFile(importDirectoryPath.resolve("kg").resolve(pathsJsonlFileName).toFile))) { reader =>
      withStreamProgress(reader.toStream, "putPaths") { paths =>
        store.putPaths(paths)
        Ok("")
      }
    }
  }

  def withStreamProgress[T, V](stream: Stream[T], taskName: String)(f: (Stream[T]) => V): V = {
    val progressBar =
      new ProgressBarBuilder()
        .setInitialMax(0)
        .setTaskName(taskName)
        .setConsumer(new DelegatingProgressBarConsumer(message => logger.info(message)))
        .setUpdateIntervalMillis(5000)
        .showSpeed
        .build
    withResource(progressBar) { progressBar =>
      f(stream.map(x => { progressBar.step(); x }))
    }
  }
}
