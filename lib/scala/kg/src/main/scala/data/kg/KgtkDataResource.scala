package data.kg

import java.io.InputStream

import data.DataResources
import formats.kg.kgtk.{KgtkEdgeWithNodes, KgtkEdgesTsvReader}
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import models.kg.{KgEdge, KgNode}

class KgtkDataResource(val edgesTsvResourceName: String) extends DataResources with WithResource {
  def getEdgesTsvResourceAsStream(): InputStream =
    getResourceAsStream(edgesTsvResourceName)

  def read(): List[KgtkEdgeWithNodes] = {
    withResource(KgtkEdgesTsvReader.open(getEdgesTsvResourceAsStream())) { reader =>
      reader.iterator.toList
    }
  }
}
