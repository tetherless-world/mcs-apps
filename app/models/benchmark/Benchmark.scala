package models.benchmark

final case class Benchmark(id: String, name: String, questionSets: List[BenchmarkQuestionSet])
