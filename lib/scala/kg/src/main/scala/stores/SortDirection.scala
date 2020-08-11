package stores

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}
import sangria.macros.derive.deriveEnumType

sealed abstract class SortDirection(val value: String) extends StringEnumEntry

case object SortDirection extends StringEnum[SortDirection] with StringCirceEnum[SortDirection] {
  case object Ascending extends SortDirection("asc")
  case object Descending extends SortDirection("desc")
  val sangriaType = deriveEnumType[SortDirection]()
  val values = findValues
}
