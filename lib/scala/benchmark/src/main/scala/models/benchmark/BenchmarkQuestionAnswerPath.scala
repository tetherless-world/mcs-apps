package models.benchmark

import models.kg.KgEdge

final case class BenchmarkQuestionAnswerPath(path: List[String], score: Float) {
  def edges: List[KgEdge] = {
    (0 until (path.length - 1) by 2).map(pathI =>
      KgEdge(
        id = s"${path(0)}-${path(path.length - 1)}-${pathI}",
        labels = List(),
        `object` = path(pathI + 2),
        origins = List(),
        questions = List(),
        relation = path(pathI + 1),
        sentences = List(),
        sources = List(),
        subject = path(pathI),
        weight = None
      )
    ).toList
  }
}
