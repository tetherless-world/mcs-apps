package data.kg

import data.DataResource
import formats.kg.cskg.{CskgEdgesCsvReader, CskgNodesCsvReader}
import formats.kg.path.KgPathsJsonlReader
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import models.kg.{KgEdge, KgNode, KgPath}

class CskgCsvDataResources(
                            val edgesCsvBz2: DataResource,
                            val nodesCsvBz2: DataResource,
                            val pathsJsonl: DataResource
) extends WithResource {
  def readEdges(): List[KgEdge] = {
    withResource(CskgEdgesCsvReader.open(edgesCsvBz2.getAsStream)) { reader =>
      reader.iterator.toList
    }
  }

  def readNodes(): List[KgNode] = {
    withResource(CskgNodesCsvReader.open(nodesCsvBz2.getAsStream)) { reader =>
      reader.iterator.toList
    }
  }

  def readPaths(): List[KgPath] = {
    withResource(KgPathsJsonlReader.open(pathsJsonl.getAsStream)) { reader =>
      reader.iterator.toList
    }
  }
}
