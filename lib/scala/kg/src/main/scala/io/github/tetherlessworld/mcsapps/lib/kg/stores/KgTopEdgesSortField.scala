package io.github.tetherlessworld.mcsapps.lib.kg.stores

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}
import sangria.macros.derive.deriveEnumType

sealed abstract class KgTopEdgesSortField(val value: String) extends StringEnumEntry

case object KgTopEdgesSortField extends StringEnum[KgTopEdgesSortField] with StringCirceEnum[KgTopEdgesSortField] {
  case object ObjectLabelPageRank extends KgTopEdgesSortField("ObjectLabelPageRank")
  case object ObjectPageRank extends KgTopEdgesSortField("ObjectPageRank")
  val sangriaType = deriveEnumType[KgTopEdgesSortField]()
  val values = findValues
}
