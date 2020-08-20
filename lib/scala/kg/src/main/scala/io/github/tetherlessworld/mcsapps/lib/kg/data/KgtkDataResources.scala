package io.github.tetherlessworld.mcsapps.lib.kg.data

import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.{KgtkEdgeWithNodes, KgtkEdgesTsvReader}
import io.github.tetherlessworld.mcsapps.lib.kg.formats.path.KgPathsJsonlReader
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.KgPath
import io.github.tetherlessworld.twxplore.lib.base.WithResource

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
