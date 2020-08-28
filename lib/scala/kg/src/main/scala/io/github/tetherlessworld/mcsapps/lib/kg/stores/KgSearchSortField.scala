package io.github.tetherlessworld.mcsapps.lib.kg.stores

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}
import sangria.macros.derive.deriveEnumType

sealed abstract class KgSearchSortField(val value: String) extends StringEnumEntry

case object KgSearchSortField extends StringEnum[KgSearchSortField] with StringCirceEnum[KgSearchSortField] {
  case object Id extends KgSearchSortField("Id")
  case object Labels extends KgSearchSortField("Labels")
  case object Sources extends KgSearchSortField("Sources")
  case object PageRank extends KgSearchSortField("PageRank")
  val sangriaType = deriveEnumType[KgSearchSortField]()
  val values = findValues
}
