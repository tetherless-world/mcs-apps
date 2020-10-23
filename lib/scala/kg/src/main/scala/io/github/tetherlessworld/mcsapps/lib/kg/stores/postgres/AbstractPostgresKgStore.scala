package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.KgNode
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.PostgresProfile


abstract class AbstractPostgresKgStore(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[PostgresProfile] {
  import profile.api._

  lazy val KgNodes = TableQuery[KgNodeTable]
  lazy val KgEdges = TableQuery[KgEdgeTable]
  lazy val KgSources = TableQuery[KgSourceTable]

  private class KgNodeTable(tag: Tag) extends Table[KgNode](tag, "KgNodes") {
    def id = column[String]("ID", O.PrimaryKey)

    //    def inDegree = column[Option[Int]]("IN_DEGREE")
    //    def labels = column[String]("LABELS")
    //    def outDegree = column[Option[Int]]("OUT_DEGREE")
    //    def pageRank = column[Option[Double]]("PAGERANK")
    def pos = column[Option[Char]]("POS")

    //    def sourceIds = column[String]("SOURCE_IDS")
    def wordNetSenseNumber = column[Option[Int]]("WORD_NET_SENSE_NUMBER")

    type KgNodeTableColumnTypes = (String, Option[Char], Option[Int])

    def * = (id, pos, wordNetSenseNumber) <> (create, extract.lift)

    private def create: KgNodeTableColumnTypes => KgNode = {
      case (id, pos, wordNetSenseNumber) =>
        KgNode(id, None, List(), None, None, pos, List(), wordNetSenseNumber)
    }

    private def extract: PartialFunction[KgNode, KgNodeTableColumnTypes] = {
      case KgNode(id, inDegree, labels, outDegree, pageRank, pos, sourceIds, wordNetSenseNumber) =>
        (id, pos, wordNetSenseNumber)
    }
  }

  class KgEdgeTable(tag: Tag) extends Table[KgEdge](tag, "KgEdges") {
    def id = column[String]("ID", O.PrimaryKey)
//    labels: List[String],
    def objectNodeId = column[String]("OBJECT_NODE_ID")
    def predicate = column[String]("PREDICATE")
//    sentences: List[String],
//    sourceIds: List[String],
    def subjectNodeId = column[String]("SUBJECT_NODE_ID")

    type KgEdgeTableColumnTypes = (String, String, String, String)

    def objectNode = foreignKey("OBJECT_NODE_FK", objectNodeId, KgNodes)(_.id)
    def subjectNode = foreignKey("SUBJECT_NODE_FK", subjectNodeId, KgNodes)(_.id)

    def * = (id, objectNodeId, predicate, subjectNodeId) <> (create, extract.lift)

    private def create: KgEdgeTableColumnTypes => KgEdge = {
      case (id, objectNodeId, predicate, subjectNodeId) =>
        KgEdge(id, List(), objectNodeId, predicate, List(), List(), subjectNodeId)
    }

    private def extract: PartialFunction[KgEdge, KgEdgeTableColumnTypes] = {
      case KgEdge(id, labels, object_, predicate, sentences, sourceIds, subject) =>
        (id, object_, predicate, subject)
    }
  }

  class KgSourceTable(tag: Tag) extends Table[KgSource](tag, "KgSources") {
    def id = column[String]("ID", O.PrimaryKey)
    def label = column[String]("LABEL")

    type KgSourceTableColumnTypes = (String, String)

    def * = (id, label) <> ((KgSource.apply _).tupled, KgSource.unapply)
  }

  class KgNodeKgSource(tag: Tag) extends Table[(Int, String, String)](tag, "KgNodeKgSource") {
    def id = column[Int]("ID", O.PrimaryKey, O.AutoInc)

    def kgNodeId = column[String]("KG_Node_ID")
    def kgSourceId = column[String]("KG_SOURCE_ID")

    def * = (id, kgNodeId, kgSourceId)

    def kgNode = foreignKey("KG_Node_FK", kgNodeId, KgNodes)(_.id)
    def kgSource = foreignKey("KG_SOURCE_FK", kgSourceId, KgSources)(_.id)
  }
}
