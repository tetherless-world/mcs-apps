package io.github.tetherlessworld.mcsapps.lib.kg.stores

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}
import sangria.macros.derive.deriveEnumType

sealed abstract class KgEdgeSortField(val value: String) extends StringEnumEntry

case object KgEdgeSortField extends StringEnum[KgEdgeSortField] with StringCirceEnum[KgEdgeSortField] {
  case object ObjectLabelPageRank extends KgEdgeSortField("ObjectLabelPageRank")
  case object ObjectPageRank extends KgEdgeSortField("ObjectPageRank")
  val sangriaType = deriveEnumType[KgEdgeSortField]()
  val values = findValues
}
