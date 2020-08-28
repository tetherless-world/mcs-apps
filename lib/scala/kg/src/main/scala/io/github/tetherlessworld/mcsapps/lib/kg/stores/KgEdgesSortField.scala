package io.github.tetherlessworld.mcsapps.lib.kg.stores

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}
import sangria.macros.derive.deriveEnumType

sealed abstract class KgEdgesSortField(val value: String) extends StringEnumEntry

case object KgEdgesSortField extends StringEnum[KgEdgesSortField] with StringCirceEnum[KgEdgesSortField] {
  case object Id extends KgEdgesSortField("Id")
  case object ObjectPageRank extends KgEdgesSortField("ObjectPageRank")
  val sangriaType = deriveEnumType[KgEdgesSortField]()
  val values = findValues
}
