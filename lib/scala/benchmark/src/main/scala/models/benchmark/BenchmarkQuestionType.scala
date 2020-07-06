package models.benchmark

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}
import sangria.macros.derive.deriveEnumType

sealed abstract class BenchmarkQuestionType(val value: String) extends StringEnumEntry

case object BenchmarkQuestionType extends StringEnum[BenchmarkQuestionType] with StringCirceEnum[BenchmarkQuestionType] {
  case object MultipleChoice extends BenchmarkQuestionType("MULTIPLE_CHOICE")
  case object TrueFalse extends BenchmarkQuestionType("TRUE_FALSE")
  val sangriaType = deriveEnumType[BenchmarkQuestionType]()
  val values = findValues
}
