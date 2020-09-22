package io.github.tetherlessworld.mcsapps.lib.kg.models.search

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}
import sangria.macros.derive.deriveEnumType

sealed abstract class KgSearchResultType(val value: String) extends StringEnumEntry

case object KgSearchResultType extends StringEnum[KgSearchResultType] with StringCirceEnum[KgSearchResultType] {
  case object Edge extends KgSearchResultType("Edge")
  case object EdgeLabel extends KgSearchResultType("EdgeLabel")
  case object Node extends KgSearchResultType("Node")
  case object NodeLabel extends KgSearchResultType("NodeLabel")
  case object Source extends KgSearchResultType("Source")
  val sangriaType = deriveEnumType[KgSearchResultType]()
  val values = findValues
}
