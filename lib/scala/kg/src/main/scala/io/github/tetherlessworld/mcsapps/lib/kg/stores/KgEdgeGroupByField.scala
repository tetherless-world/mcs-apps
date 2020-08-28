package io.github.tetherlessworld.mcsapps.lib.kg.stores

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}
import sangria.macros.derive.deriveEnumType

sealed abstract class KgEdgeGroupByField(val value: String) extends StringEnumEntry

case object KgEdgeGroupByField extends StringEnum[KgEdgeGroupByField] with StringCirceEnum[KgEdgeGroupByField] {
  case object ObjectLabelPageRank extends KgEdgeGroupByField("Predicate")
  val sangriaType = deriveEnumType[KgEdgeGroupByField]()
  val values = findValues
}
