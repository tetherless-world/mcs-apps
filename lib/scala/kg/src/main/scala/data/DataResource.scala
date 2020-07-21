package data

import java.io.BufferedInputStream

final case class DataResource(val name: String) {
  final def getAsStream() =
    new BufferedInputStream(getClass.getResourceAsStream(name))
}
