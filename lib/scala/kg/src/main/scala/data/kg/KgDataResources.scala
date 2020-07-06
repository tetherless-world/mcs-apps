package data.kg

import java.io.InputStream

import data.DataResources
import formats.kg.cskg.{CskgEdgesCsvReader, CskgNodesCsvReader}
import formats.kg.path.KgPathsJsonlReader
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import models.kg.{KgEdge, KgNode, KgPath}

class KgDataResources(
  val edgesCsvBz2ResourceName: String,
  val nodesCsvBz2ResourceName: String,
  val pathsJsonlResourceName: String,
) extends DataResources with WithResource {
  def getEdgesCsvResourceAsStream(): InputStream =
    getResourceAsStream(edgesCsvBz2ResourceName)

  def getNodesCsvResourceAsStream(): InputStream =
    getResourceAsStream(nodesCsvBz2ResourceName)

  def getPathsJsonlResourceAsStream(): InputStream =
    getResourceAsStream(pathsJsonlResourceName)

  def readEdges(): List[KgEdge] = {
    withResource(CskgEdgesCsvReader.open(getEdgesCsvResourceAsStream())) { reader =>
      reader.iterator.toList
    }
  }

  def readNodes(): List[KgNode] = {
    withResource(CskgNodesCsvReader.open(getNodesCsvResourceAsStream())) { reader =>
      reader.iterator.toList
    }
  }

  def readPaths(): List[KgPath] = {
    withResource(KgPathsJsonlReader.open(getPathsJsonlResourceAsStream())) { reader =>
      reader.iterator.toList
    }
  }
}
