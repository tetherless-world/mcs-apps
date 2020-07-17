package data.kg

import java.io.InputStream

import data.DataResources
import formats.kg.kgtk.{KgtkEdgeWithNodes, KgtkEdgesTsvReader}
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import models.kg.{KgEdge, KgNode}

class KgtkDataResource(val tsvResourceName: String) extends DataResources with WithResource {
  def getTsvResourceAsStream(): InputStream =
    getResourceAsStream(tsvResourceName)

  def read(): List[KgtkEdgeWithNodes] = {
    withResource(KgtkEdgesTsvReader.open(getTsvResourceAsStream())) { reader =>
      reader.iterator.toList
    }
  }
}
