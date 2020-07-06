package formats.benchmark

import io.github.tetherlessworld.twxplore.lib.base.WithResource

class BenchmarkAnswersJsonlReaderSpec extends WordSpec with Matchers with WithResource {
  "Benchmark answers .jsonl reader" can {
    "read the test data" in {
      withResource(BenchmarkAnswersJsonlReader.open(TestBenchmarkDataResources.getBenchmarkAnswersJsonlResourceAsStream())) { reader =>
        val answers = reader.iterator.toList
        for (answer <- answers) {
          answer.submissionId should not be empty
          answer.choiceId should not be empty
          answer.questionId should not be empty
          answer.explanation should not be None
          answer.explanation.get.choiceAnalyses should not be None
          for (choiceAnalysis <- answer.explanation.get.choiceAnalyses.get) {
            choiceAnalysis.questionAnswerPaths should not be empty
            choiceAnalysis.choiceId should not be empty
            for (questionAnswerPaths <- choiceAnalysis.questionAnswerPaths) {
              questionAnswerPaths.startNodeId should not be empty
              questionAnswerPaths.endNodeId should not be empty
              questionAnswerPaths.score should not be 0
              questionAnswerPaths.paths should not be empty
              for (path <- questionAnswerPaths.paths) {
                path.path should not be empty
                path.path(0) should equal(questionAnswerPaths.startNodeId)
                path.path(path.path.length - 1) should equal(questionAnswerPaths.endNodeId)
                path.score should not be 0
              }
            }
          }
        }
      }
    }
  }
}
