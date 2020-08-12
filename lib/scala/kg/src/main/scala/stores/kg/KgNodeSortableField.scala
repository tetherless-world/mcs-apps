package stores.kg

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}

import sangria.macros.derive.deriveEnumType

sealed abstract class KgNodeSortableField(val value: String) extends StringEnumEntry

case object KgNodeSortableField extends StringEnum[KgNodeSortableField] with StringCirceEnum[KgNodeSortableField] {
  case object Id extends KgNodeSortableField("Id")
  case object Labels extends KgNodeSortableField("Labels")
  case object Sources extends KgNodeSortableField("Sources")
  case object PageRank extends KgNodeSortableField("PageRank")
  val sangriaType = deriveEnumType[KgNodeSortableField]()
  val values = findValues
}
