 package io.github.tetherlessworld.mcsapps.lib.kg.stores

import java.nio.file.{Files, Path, Paths}
import java.util.stream.Collectors

import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.KgtkEdgesTsvIterator
import javax.inject.{Inject, Singleton}
import org.slf4j.LoggerFactory
import play.api.Configuration

import scala.collection.JavaConverters._
import scala.concurrent.ExecutionContext

/**
 * Code to bootstrap a KgStore from data on the file system.
 *
 * Usually runs on startup by instantiating it as an eager singleton:
 * https://www.playframework.com/documentation/2.6.x/ScalaDependencyInjection#Eager-bindings
 */
@Singleton
class KgDataDirectoryLoader(dataDirectoryPath: Path, kgCommandStore: KgCommandStore, kgQueryStore: KgQueryStore)(implicit ec: ExecutionContext) extends WithIteratorProgress {
  @Inject
  def this(configuration: Configuration, kgCommandStore: KgCommandStore, kgQueryStore: KgQueryStore)(implicit ec: ExecutionContext) =
    this(Paths.get(configuration.getOptional[String]("kgDataDirectoryPath").getOrElse("/data/kg")), kgCommandStore, kgQueryStore)

  private val logger = LoggerFactory.getLogger(getClass)

  private def loadDataDirectory(dataDirectoryPath: Path): Boolean = {
    if (!Files.isDirectory(dataDirectoryPath)) {
      logger.warn("KG data directory {} does not exist", dataDirectoryPath)
      return false
    }

    logger.info("scanning {} for KG data", dataDirectoryPath)

    val filePaths: List[Path] = Files.list(dataDirectoryPath).collect(Collectors.toList()).asScala.toList.filter(Files.isRegularFile(_))

    if (filePaths.isEmpty) {
      logger.warn("KG data directory {} is empty", dataDirectoryPath)
      return false
    }

    val loaded =
      filePaths.foldLeft(false)((result, filePath) => {
        val fileName = filePath.getFileName.toString.toLowerCase
        if (fileName.endsWith(".tsv") || fileName.endsWith(".tsv.bz2")) {
          logger.info("loading KGTK edges from {}", filePath)
//          ec.execute { () => {
            withResource(KgtkEdgesTsvIterator.open(filePath)) { iterator =>
              withIteratorProgress(iterator, logger, filePath.toString) { iterator =>
                kgCommandStore.withTransaction { _.putKgtkEdgesWithNodes(iterator) }
              }
            }
//          }}
          true
        } else if (fileName.endsWith(".md")) {
          false
        } else {
          logger.warn("ignoring file {} with unknown extension", filePath)
          result
        }
      })
//    if (loaded) {
//      logger.info("loaded KG data from {}", dataDirectoryPath)
//    }
    loaded
  }

  if (kgQueryStore.isEmpty) {
    loadDataDirectory(dataDirectoryPath)
  } else {
    logger.info("KG store is not empty, not attempting to load data from the file system")
  }
}
