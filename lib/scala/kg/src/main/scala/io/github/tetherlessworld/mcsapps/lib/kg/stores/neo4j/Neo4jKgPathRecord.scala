package io.github.tetherlessworld.mcsapps.lib.kg.stores.neo4j

import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.KgEdge

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
      labels = List(), `object` = objectNodeId,
      predicate = pathEdgePredicate,
      sentences = List(),
      sourceIds = sources,
      subject = subjectNodeId
    )
}
