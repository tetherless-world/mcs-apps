package data.kg

import data.DataResource
import formats.kg.kgtk.{KgtkEdgeWithNodes, KgtkEdgesTsvReader}
import formats.kg.path.KgPathsJsonlReader
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import models.kg.KgPath

class KgtkDataResources(
                         val edgesTsvBz2: DataResource,
                         val pathsJsonl: DataResource
) extends WithResource {
  def readKgtkEdgesWithNodes(): List[KgtkEdgeWithNodes] = {
    withResource(KgtkEdgesTsvReader.open(edgesTsvBz2.getAsStream)) { reader =>
      reader.iterator.toList
    }
  }

  def readPaths(): List[KgPath] = {
    withResource(KgPathsJsonlReader.open(pathsJsonl.getAsStream)) { reader =>
      reader.iterator.toList
    }
  }
}
