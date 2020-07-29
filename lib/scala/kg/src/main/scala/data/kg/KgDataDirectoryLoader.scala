package data.kg

import java.nio.file.{Files, Path, Paths}
import java.util.Collections
import java.util.stream.Collectors

import formats.kg.kgtk.KgtkEdgesTsvReader
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import javax.inject.{Inject, Singleton}
import org.apache.commons.io.FilenameUtils
import org.slf4j.LoggerFactory
import stores.kg.KgStore

import scala.collection.JavaConverters._

/**
 * Code to bootstrap a KgStore from data on the file system.
 *
 * Usually runs on startup by instantiating it as an eager singleton:
 * https://www.playframework.com/documentation/2.6.x/ScalaDependencyInjection#Eager-bindings
 */
@Singleton
class KgDataDirectoryLoader @Inject()(store: KgStore) extends WithResource {
  private val logger = LoggerFactory.getLogger(getClass)

  private def loadDataDirectory(dataDirectoryPath: Path): Boolean = {
    if (!Files.isDirectory(dataDirectoryPath)) {
      logger.warn("KG data directory {} does not exist", dataDirectoryPath)
      return false
    }

    logger.info("scanning {} for KG data", dataDirectoryPath)

    Files.list(dataDirectoryPath).collect(Collectors.toList()).asScala.filter(Files.isRegularFile(_)).map(filePath => {
      FilenameUtils.getExtension(filePath.getFileName.toString).toLowerCase match {
        case ".tsv" => {
          logger.info("loading KGTK edges from {}", filePath)
          withResource(KgtkEdgesTsvReader.open(filePath)) { reader =>
            store.putKgtkEdgesWithNodes(reader.iterator)
          }
        }
      }
    })
    true
  }

  if (store.isEmpty) {
    loadDataDirectory(Paths.get("/data"))
  } else {
    logger.info("KG store is not empty, not attempting to load data from the file system")
  }
}
