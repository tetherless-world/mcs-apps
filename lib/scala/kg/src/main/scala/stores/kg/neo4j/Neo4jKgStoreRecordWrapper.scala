package stores.kg.neo4j

import models.kg.{KgEdge, KgNode}
import org.neo4j.driver.Record

import scala.collection.JavaConverters._

class Neo4jKgStoreRecordWrapper(record: Record) {
  private val ListDelimChar = Neo4jKgStore.ListDelimChar

  private def toList(value: String): List[String] = {
    if (value.isEmpty) {
      List()
    } else {
      value.split(ListDelimChar).toList
    }
  }

  def toEdge: KgEdge = {
    val recordMap = record.asMap().asScala.toMap
    KgEdge(
      id = recordMap("edge.id").asInstanceOf[String],
      labels = toList(recordMap("edge.labels").asInstanceOf[String]),
      `object` = recordMap("object.id").asInstanceOf[String],
      origins = toList(recordMap("edge.origins").asInstanceOf[String]),
      questions = toList(recordMap("edge.questions").asInstanceOf[String]),
      sentences = toList(recordMap("edge.sentences").asInstanceOf[String]),
      predicate = recordMap("type(edge)").asInstanceOf[String],
      sources = toList(recordMap("edge.sources").asInstanceOf[String]),
      subject = recordMap("subject.id").asInstanceOf[String],
      weight = Option(recordMap("edge.weight")).map(weight => weight.asInstanceOf[Double].doubleValue())
    )
  }

  def toNode: KgNode = {
    val recordMap = record.asMap().asScala.toMap.asInstanceOf[Map[String, String]]
    KgNode(
      id = recordMap("node.id"),
      labels = toList(recordMap("node.labels")),
      pageRank = Option(recordMap("node.pageRank")).map(_.asInstanceOf[Double].doubleValue()),
      pos = Option(recordMap("node.pos")),
      sources = toList(recordMap("node.sources"))
    )
  }

  def toPathRecord: Neo4jKgPathRecord = {
    Neo4jKgPathRecord(
      objectNodeId = record.get("objectNode.id").asString(),
      pathId = record.get("path.id").asString(),
      pathEdgeIndex = record.get("path.pathEdgeIndex").asInt(),
      pathEdgePredicate = record.get("path.pathEdgePredicate").asString(),
      sources = record.get("path.sources").asString().split(ListDelimChar).toList,
      subjectNodeId = record.get("subjectNode.id").asString()
    )
  }
}
