package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.PostgresProfile

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}


abstract class AbstractPostgresKgStore(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[PostgresProfile] {
  import profile.api._

  protected val SentencesDelimChar = '|'
  protected val SentencesDelimString: String = SentencesDelimChar.toString

  lazy val edges = TableQuery[EdgeTable]
  lazy val edgeLabels = TableQuery[EdgeLabelTable]
  lazy val edgeSources = TableQuery[EdgeSourceTable]
  lazy val nodes = TableQuery[NodeTable]
  lazy val nodeLabels = TableQuery[NodeLabelTable]
  lazy val nodeLabelEdges = TableQuery[NodeLabelEdgeTable]
  lazy val nodeLabelEdgeSources = TableQuery[NodeLabelEdgeSourceTable]
  lazy val nodeLabelSource = TableQuery[NodeLabelSourceTable]
  lazy val nodeSources = TableQuery[NodeSourceTable]
  lazy val nodeNodeLabels = TableQuery[NodeNodeLabelTable]
  lazy val sources = TableQuery[SourceTable]

  protected final def runTransaction[R](a: DBIOAction[R, NoStream, Nothing]): Future[R] = {
    db.run(a.transactionally)
  }

  protected final def runSyncTransaction[R](a: DBIOAction[R, NoStream, Nothing], duration: Duration = Duration.Inf): R = {
    Await.result(runTransaction(a), duration)
  }

  protected final case class EdgeRow(id: String, objectNodeId: String, predicate: String, sentences: String, subjectNodeId: String)
  protected final case class NodeRow(id: String, inDegree: Option[Short], outDegree: Option[Short], pageRank: Option[Float], pos: Option[Char], wordNetSenseNumber: Option[Short])

  private class EdgeTable(tag: Tag) extends Table[EdgeRow](tag, "edge") {
    def id = column[String]("id", O.PrimaryKey)
    def objectNodeId = column[String]("object_node_id")
    def predicate = column[String]("predicate")
    def sentences = column[String]("sentences")
    def subjectNodeId = column[String]("subject_node_id")

    def * = (id, objectNodeId, predicate, sentences, subjectNodeId) <> (EdgeRow.tupled, EdgeRow.unapply)

    def objectNode = foreignKey("object_node_fk", objectNodeId, nodes)(_.id)
    def subjectNode = foreignKey("subject_node_fk", subjectNodeId, nodes)(_.id)

    def unique_constraint = index("_edge_unique_idx", (objectNodeId, subjectNodeId, predicate), unique = true)
  }

  private class EdgeLabelTable(tag: Tag) extends Table[(String, String)](tag, "edge_label") {
    def EdgeId = column[String]("edge_id")
    def label = column[String]("label")

    def * = (EdgeId, label)

    def Edge = foreignKey("edge_fk", EdgeId, edges)(_.id)

    def pk = primaryKey("edge_label_pk", (EdgeId, label))
  }

  private class EdgeSourceTable(tag: Tag) extends Table[(String, String)](tag, "edge_x_source") {
    def EdgeId = column[String]("edge_id")
    def SourceId = column[String]("source_id")

    def * = (EdgeId, SourceId)

    def Edge = foreignKey("edge_fk", EdgeId, edges)(_.id)

    def pk = primaryKey("edge_source_pk", (EdgeId, SourceId))
  }

  private class NodeTable(tag: Tag) extends Table[NodeRow](tag, "node") {
    def id = column[String]("id", O.PrimaryKey)
    def inDegree = column[Option[Short]]("in_degree")
    def outDegree = column[Option[Short]]("out_degree")
    def pageRank = column[Option[Float]]("page_rank")
    def pos = column[Option[Char]]("pos", O.Length(1))
    def wordNetSenseNumber = column[Option[Short]]("word_net_sense_number")

    def * = (id, inDegree, outDegree, pageRank, pos, wordNetSenseNumber) <> (NodeRow.tupled, NodeRow.unapply)
  }

  private class NodeNodeLabelTable(tag: Tag) extends Table[(String, String)](tag, "node_x_node_label") {
    def NodeId = column[String]("node_id")
    def label = column[String]("label")

    def * = (NodeId, label)

    def Node = foreignKey("node_fk", NodeId, nodes)(_.id)

    def pk = primaryKey("node_label_pk", (NodeId, label))
  }

  private class NodeSourceTable(tag: Tag) extends Table[(String, String)](tag, "node_x_source") {
    def NodeId = column[String]("node_id")
    def SourceId = column[String]("source_id")

    def * = (NodeId, SourceId)

    def Node = foreignKey("node_fk", NodeId, nodes)(_.id)
    def Source = foreignKey("source_fk", SourceId, sources)(_.id)

    def pk = primaryKey("node_source_pk", (NodeId, SourceId))
  }

  private class NodeLabelTable(tag: Tag) extends Table[(String, Option[Float])](tag, "node_x_label") {
    def label = column[String]("label", O.PrimaryKey)
    def pageRank = column[Option[Float]]("page_rank")

    def * = (label, pageRank)
  }

  private class NodeLabelEdgeTable(tag: Tag) extends Table[(Int, String, String)](tag, "node_label_edge") {
    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def objectNodeLabelLabel = column[String]("object_node_label_label")
    def subjectNodeLabelLabel = column[String]("subject_node_label_label")

    def * = (id, objectNodeLabelLabel, subjectNodeLabelLabel)

    def objectNodeLabel = foreignKey("object_node_label_fk", objectNodeLabelLabel, nodeLabels)(_.label)
    def subjectNodeLabel = foreignKey("subject_node_label_fk", subjectNodeLabelLabel, nodeLabels)(_.label)

    def unique_constraint = index("node_label_edge_unique_idx", (objectNodeLabelLabel, subjectNodeLabelLabel), unique = true)
  }

  private class NodeLabelEdgeSourceTable(tag: Tag) extends Table[(Int, String)](tag, "node_label_edge_x_source") {
    def NodeLabelEdgeId = column[Int]("node_label_edge_id")
    def SourceId = column[String]("source_id")

    def * = (NodeLabelEdgeId, SourceId)

    def NodeLabelEdge = foreignKey("node_label_edge_fk", NodeLabelEdgeId, NodeLabelEdges)(_.id)
    def Source = foreignKey("source_fk", SourceId, sources)(_.id)

    def pk = primaryKey("node_label_edge_source_pk", (NodeLabelEdgeId, SourceId))
  }

  private class NodeLabelSourceTable(tag: Tag) extends Table[(String, String)](tag, "node_label_x_source") {
    def NodeLabelLabel = column[String]("node_label_label")
    def SourceId = column[String]("source_id")

    def * = (NodeLabelLabel, SourceId)

    def NodeLabel = foreignKey("node_label_fk", NodeLabelLabel, nodeLabels)(_.label)
    def Source = foreignKey("source_fk", SourceId, sources)(_.id)

    def pk = primaryKey("node_label_source_pk", (NodeLabelLabel, SourceId))
  }

  private class SourceTable(tag: Tag) extends Table[(String, String)](tag, "source") {
    def id = column[String]("id", O.PrimaryKey)
    def label = column[String]("label")

    def * = (id, label)
  }
}
