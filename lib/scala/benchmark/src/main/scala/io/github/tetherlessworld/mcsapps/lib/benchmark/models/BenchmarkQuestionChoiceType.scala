package io.github.tetherlessworld.mcsapps.lib.benchmark.models

import enumeratum.values.{StringCirceEnum, StringEnum, StringEnumEntry}
import sangria.macros.derive.deriveEnumType

sealed abstract class BenchmarkQuestionChoiceType(val value: String) extends StringEnumEntry

case object BenchmarkQuestionChoiceType extends StringEnum[BenchmarkQuestionChoiceType] with StringCirceEnum[BenchmarkQuestionChoiceType] {
  case object Answer extends BenchmarkQuestionChoiceType("ANSWER")
  case object Hypothesis extends BenchmarkQuestionChoiceType("HYPOTHESIS")
  case object Solution extends BenchmarkQuestionChoiceType("SOLUTION")
  val sangriaType = deriveEnumType[BenchmarkQuestionChoiceType]()
  val values = findValues
}
