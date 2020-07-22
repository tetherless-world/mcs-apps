package stores.kg.neo4j

import models.kg.KgEdge

final case class Neo4jKgPathRecord(
                                    sources: List[String],
                                    objectNodeId: String,
                                    pathEdgeIndex: Int,
                                    pathEdgePredicate: String,
                                    pathId: String,
                                    subjectNodeId: String
                                  ) {
  def toEdge: KgEdge =
    KgEdge(
      id = s"${pathId}-${pathEdgeIndex}",
      labels = List(),
      `object` = objectNodeId,
      origins = List(),
      questions = List(),
      predicate = pathEdgePredicate,
      sentences = List(),
      sources = sources,
      subject = subjectNodeId,
      weight = None
    )
}
