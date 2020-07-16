package data.kg

import java.io.InputStream

import data.DataResources
import formats.kg.kgtk.KgtkTsvReader
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import models.kg.{KgEdge, KgEdgeWithNodes, KgNode}

class KgtkDataResource(val tsvResourceName: String) extends DataResources with WithResource {
  def getTsvResourceAsStream(): InputStream =
    getResourceAsStream(tsvResourceName)

  def read(): List[KgEdgeWithNodes] = {
    withResource(KgtkTsvReader.open(getTsvResourceAsStream())) { reader =>
      reader.iterator.toList
    }
  }
}
