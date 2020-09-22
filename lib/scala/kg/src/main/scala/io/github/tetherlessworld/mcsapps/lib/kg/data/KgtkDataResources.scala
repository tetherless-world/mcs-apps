package io.github.tetherlessworld.mcsapps.lib.kg.data

import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.{KgtkEdgeWithNodes, KgtkEdgesTsvIterator}
import io.github.tetherlessworld.mcsapps.lib.kg.formats.path.KgPathsJsonlIterator
import io.github.tetherlessworld.mcsapps.lib.kg.models.path.KgPath
import io.github.tetherlessworld.twxplore.lib.base.WithResource

class KgtkDataResources(
                         val edgesTsvBz2: DataResource,
                         val pathsJsonl: DataResource
) extends WithResource {
  def readKgtkEdgesWithNodes(): List[KgtkEdgeWithNodes] = {
    withResource(KgtkEdgesTsvIterator.open(edgesTsvBz2.getAsStream)) { reader =>
      reader.toList
    }
  }

  def readPaths(): List[KgPath] = {
    withResource(KgPathsJsonlIterator.open(pathsJsonl.getAsStream)) { reader =>
      reader.toList
    }
  }
}
