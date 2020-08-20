package io.github.tetherlessworld.mcsapps.lib.kg.stores

import java.io.FileOutputStream
import java.nio.file.Files

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgtkDataResources
import io.github.tetherlessworld.mcsapps.lib.kg.stores.mem.MemKgStore
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.apache.commons.io.IOUtils
import org.scalatest.{Matchers, WordSpec}

class KgDataDirectoryLoaderSpec extends WordSpec with Matchers with WithResource {
  import scala.concurrent.ExecutionContext.Implicits.global

  "KG data directory loader" can {
    "load data from a temporary directory" in {
      val tempDirPath = Files.createTempDirectory(null)
      val tempFilePath = tempDirPath.resolve("kg.tsv.bz2")
      try {
        // Copy file in
        withResource(TestKgtkDataResources.edgesTsvBz2.getAsStream()) { inputStream =>
          withResource(new FileOutputStream(tempFilePath.toFile)) { outputStream => {
            IOUtils.copy(inputStream, outputStream)
          }
          }
        }

        val store = new MemKgStore
        store.isEmpty should be(true)
        new KgDataDirectoryLoader(dataDirectoryPath = tempDirPath, kgCommandStore = store, kgQueryStore = store)
        def waitForData: Boolean = {
          for (i <- 0 to 100) {
            if (!store.isEmpty) {
              return true;
            }
            Thread.sleep(100)
          }
          false
        }
        waitForData should be(true)
      } finally {
        Files.deleteIfExists(tempFilePath)
        Files.delete(tempDirPath)
      }
    }
  }
}
