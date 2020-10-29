package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.PostgresProfile

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}


abstract class AbstractPostgresKgStore(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[PostgresProfile] {
  import profile.api._

  protected val SentencesDelimChar = '|'
  protected val SentencesDelimString = SentencesDelimChar.toString

  lazy val kgEdges = TableQuery[KgEdgeTable]
  lazy val kgEdgeLabels = TableQuery[KgEdgeLabelTable]
  lazy val kgEdgeKgSources = TableQuery[KgEdgeKgSourceTable]
  lazy val kgNodes = TableQuery[KgNodeTable]
  lazy val kgNodeLabels = TableQuery[KgNodeLabelTable]
  lazy val kgNodeLabelEdges = TableQuery[KgNodeLabelEdgeTable]
  lazy val kgNodeLabelEdgeKgSources = TableQuery[KgNodeLabelEdgeKgSourceTable]
  lazy val kgNodeLabelKgSource = TableQuery[KgNodeLabelKgSourceTable]
  lazy val kgNodeKgSources = TableQuery[KgNodeKgSourceTable]
  lazy val kgNodeKgNodeLabels = TableQuery[KgNodeKgNodeLabelTable]
  lazy val kgSources = TableQuery[KgSourceTable]

  protected def runTransaction[R](a: DBIOAction[R, NoStream, Nothing]): Future[R] = {
    db.run(a.transactionally)
  }

  protected def runSyncTransaction[R](a: DBIOAction[R, NoStream, Nothing], duration: Duration = Duration.Inf): R = {
    Await.result(runTransaction(a), duration)
  }

  protected final case class KgEdgeRow(id: String, objectKgNodeId: String, predicate: String, sentences: String, subjectKgNodeId: String)
  protected final case class KgNodeRow(id: String, inDegree: Option[Short], outDegree: Option[Short], pageRank: Option[Float], pos: Option[Char], wordNetSenseNumber: Option[Short])

  private class KgEdgeTable(tag: Tag) extends Table[KgEdgeRow](tag, "edge") {
    def id = column[String]("id", O.PrimaryKey)
    def objectKgNodeId = column[String]("object_node_id")
    def predicate = column[String]("predicate")
    def sentences = column[String]("sentences")
    def subjectKgNodeId = column[String]("subject_node_id")

    def * = (id, objectKgNodeId, predicate, sentences, subjectKgNodeId) <> (KgEdgeRow.tupled, KgEdgeRow.unapply)

    def objectNode = foreignKey("object_node_fk", objectKgNodeId, kgNodes)(_.id)
    def subjectNode = foreignKey("subject_node_fk", subjectKgNodeId, kgNodes)(_.id)

    def unique_constraint = index("kg_edge_unique_idx", (objectKgNodeId, subjectKgNodeId, predicate), unique = true)
  }

  private class KgEdgeLabelTable(tag: Tag) extends Table[(String, String)](tag, "edge_label") {
    def kgEdgeId = column[String]("edge_id")
    def label = column[String]("label")

    def * = (kgEdgeId, label)

    def kgEdge = foreignKey("edge_fk", kgEdgeId, kgEdges)(_.id)

    def pk = primaryKey("edge_label_pk", (kgEdgeId, label))
  }

  private class KgEdgeKgSourceTable(tag: Tag) extends Table[(String, String)](tag, "edge_x_source") {
    def kgEdgeId = column[String]("edge_id")
    def kgSourceId = column[String]("source_id")

    def * = (kgEdgeId, kgSourceId)

    def kgEdge = foreignKey("edge_fk", kgEdgeId, kgEdges)(_.id)

    def pk = primaryKey("edge_source_pk", (kgEdgeId, kgSourceId))
  }

  private class KgNodeTable(tag: Tag) extends Table[KgNodeRow](tag, "node") {
    def id = column[String]("id", O.PrimaryKey)
    def inDegree = column[Option[Short]]("in_degree")
    def outDegree = column[Option[Short]]("out_degree")
    def pageRank = column[Option[Float]]("page_rank")
    def pos = column[Option[Char]]("pos", O.Length(1))
    def wordNetSenseNumber = column[Option[Short]]("word_net_sense_number")

    def * = (id, inDegree, outDegree, pageRank, pos, wordNetSenseNumber) <> (KgNodeRow.tupled, KgNodeRow.unapply)
  }

  private class KgNodeKgNodeLabelTable(tag: Tag) extends Table[(String, String)](tag, "node_x_node_label") {
    def kgNodeId = column[String]("node_id")
    def label = column[String]("label")

    def * = (kgNodeId, label)

    def kgNode = foreignKey("node_fk", kgNodeId, kgNodes)(_.id)

    def pk = primaryKey("node_label_pk", (kgNodeId, label))
  }

  private class KgNodeKgSourceTable(tag: Tag) extends Table[(String, String)](tag, "node_x_source") {
    def kgNodeId = column[String]("node_id")
    def kgSourceId = column[String]("source_id")

    def * = (kgNodeId, kgSourceId)

    def kgNode = foreignKey("node_fk", kgNodeId, kgNodes)(_.id)
    def kgSource = foreignKey("source_fk", kgSourceId, kgSources)(_.id)

    def pk = primaryKey("node_source_pk", (kgNodeId, kgSourceId))
  }

  private class KgNodeLabelTable(tag: Tag) extends Table[(String, Option[Float])](tag, "node_x_label") {
    def label = column[String]("label", O.PrimaryKey)
    def pageRank = column[Option[Float]]("page_rank")

    def * = (label, pageRank)
  }

  private class KgNodeLabelEdgeTable(tag: Tag) extends Table[(Int, String, String)](tag, "node_label_edge") {
    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def objectKgNodeLabelLabel = column[String]("object_node_label_label")
    def subjectKgNodeLabelLabel = column[String]("subject_node_label_label")

    def * = (id, objectKgNodeLabelLabel, subjectKgNodeLabelLabel)

    def objectKgNodeLabel = foreignKey("object_node_label_fk", objectKgNodeLabelLabel, kgNodeLabels)(_.label)
    def subjectKgNodeLabel = foreignKey("subject_node_label_fk", subjectKgNodeLabelLabel, kgNodeLabels)(_.label)

    def unique_constraint = index("node_label_edge_unique_idx", (objectKgNodeLabelLabel, subjectKgNodeLabelLabel), unique = true)
  }

  private class KgNodeLabelEdgeKgSourceTable(tag: Tag) extends Table[(Int, String)](tag, "node_label_edge_x_source") {
    def kgNodeLabelEdgeId = column[Int]("node_label_edge_id")
    def kgSourceId = column[String]("source_id")

    def * = (kgNodeLabelEdgeId, kgSourceId)

    def kgNodeLabelEdge = foreignKey("node_label_edge_fk", kgNodeLabelEdgeId, kgNodeLabelEdges)(_.id)
    def kgSource = foreignKey("source_fk", kgSourceId, kgSources)(_.id)

    def pk = primaryKey("node_label_edge_source_pk", (kgNodeLabelEdgeId, kgSourceId))
  }

  private class KgNodeLabelKgSourceTable(tag: Tag) extends Table[(String, String)](tag, "node_label_x_source") {
    def kgNodeLabelLabel = column[String]("node_label_label")
    def kgSourceId = column[String]("source_id")

    def * = (kgNodeLabelLabel, kgSourceId)

    def kgNodeLabel = foreignKey("node_label_fk", kgNodeLabelLabel, kgNodeLabels)(_.label)
    def kgSource = foreignKey("source_fk", kgSourceId, kgSources)(_.id)

    def pk = primaryKey("node_label_source_pk", (kgNodeLabelLabel, kgSourceId))
  }

  private class KgSourceTable(tag: Tag) extends Table[(String, String)](tag, "source") {
    def id = column[String]("id", O.PrimaryKey)
    def label = column[String]("label")

    def * = (id, label)
  }
}
