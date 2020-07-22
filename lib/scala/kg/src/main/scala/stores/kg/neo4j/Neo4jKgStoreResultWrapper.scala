package stores.kg.neo4j

import models.kg.{KgEdge, KgNode, KgPath}
import org.neo4j.driver.{Record, Result}

import scala.collection.JavaConverters._

class Neo4jKgStoreResultWrapper(result: Result) {
  private implicit class Neo4jKgStoreRecordWrapperImplicit(record: Record) extends Neo4jKgStoreRecordWrapper(record)

  def toEdges: List[KgEdge] =
    result.asScala.toList.map(record => record.toEdge)

  def toNodes: List[KgNode] =
    result.asScala.toList.map(record => record.toNode)

  def toPaths: List[KgPath] = {
    result.asScala.toList.map(record => record.toPathRecord).groupBy(pathRecord => pathRecord.pathId).map(pathRecordsEntry =>
      pathRecordsEntry match {
        case (pathId, pathRecords) =>
          KgPath(
            edges = pathRecords.sortBy(pathRecord => pathRecord.pathEdgeIndex).map(pathRecord => pathRecord.toEdge),
            id = pathId,
            sources = pathRecords(0).sources,
          )
      }
    ).toList
  }
}
