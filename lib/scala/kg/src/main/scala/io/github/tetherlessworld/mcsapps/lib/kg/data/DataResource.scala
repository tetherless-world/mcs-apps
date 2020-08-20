package io.github.tetherlessworld.mcsapps.lib.kg.data

import java.io.BufferedInputStream

import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.apache.commons.io.IOUtils

final case class DataResource(name: String) extends WithResource {
  final def getAsStream() = {
    val resourceAsStream = getClass.getResourceAsStream(name)
    if (resourceAsStream == null) {
      throw new NullPointerException
    }
    new BufferedInputStream(resourceAsStream)
  }

  final def getAsString(): String = {
    withResource(getAsStream()) { stream =>
      IOUtils.toString(stream, "UTF-8")
    }
  }
}
