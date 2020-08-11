package stores.kg

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}

import sangria.macros.derive.deriveEnumType

sealed abstract class KgNodeSortableField(val value: String) extends StringEnumEntry

case object KgNodeSortableField extends StringEnum[KgNodeSortableField] with StringCirceEnum[KgNodeSortableField] {
  case object Id extends KgNodeSortableField("id")
  case object Labels extends KgNodeSortableField("labels")
  case object Sources extends KgNodeSortableField("sources")
  case object PageRank extends KgNodeSortableField("pageRank")
  val sangriaType = deriveEnumType[KgNodeSortableField]()
  val values = findValues
}