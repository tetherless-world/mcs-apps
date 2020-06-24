package models.benchmark

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}
import sangria.macros.derive.deriveEnumType

sealed abstract class BenchmarkQuestionPromptType(val value: String) extends StringEnumEntry

case object BenchmarkQuestionPromptType extends StringEnum[BenchmarkQuestionPromptType] with StringCirceEnum[BenchmarkQuestionPromptType] {
  case object Goal extends BenchmarkQuestionPromptType("GOAL")
  case object Observation extends BenchmarkQuestionPromptType("OBSERVATION")
  case object Question extends BenchmarkQuestionPromptType("QUESTION")
  val sangriaType = deriveEnumType[BenchmarkQuestionPromptType]()
  val values = findValues
}
