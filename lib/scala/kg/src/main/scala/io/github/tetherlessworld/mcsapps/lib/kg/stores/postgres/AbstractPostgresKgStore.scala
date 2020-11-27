package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.{KgNode, KgNodeLabel}
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource
import io.github.tetherlessworld.mcsapps.lib.kg.stores.HasDatabaseConfigProvider

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}


abstract class AbstractPostgresKgStore(protected val databaseConfigProvider: PostgresStoreConfigProvider) extends HasDatabaseConfigProvider[ExtendedPostgresProfile] {
  import profile.api._

  protected val SentencesDelimChar = '|'
  protected val SentencesDelimString: String = SentencesDelimChar.toString

  protected val NodeContextTopEdgesLimit = 10
  protected val NodeLabelContextTopEdgesLimit = 10

  protected lazy val edges = TableQuery[EdgeTable]
  protected lazy val edgeLabels = TableQuery[EdgeLabelTable]
  protected lazy val edgeSources = TableQuery[EdgeSourceTable]
  protected object nodes extends TableQuery(new NodeTable(_)) {
    def getById(id: String) =
      nodes.filter(_.id === id).result.headOption

    def withLabelSource(nodeQuery: Query[NodeTable, NodeRow, Seq] = nodes) =
      for {
        node <- nodeQuery
        nodeNodeLabel <- nodeNodeLabels if nodeNodeLabel.nodeId === node.id
        nodeLabel <- nodeNodeLabel.nodeLabel
        nodeSource <- nodeSources if nodeSource.nodeId === node.id
        source <- nodeSource.source
      } yield (node, nodeLabel, source)

  }
  protected object nodeLabels extends TableQuery(new NodeLabelTable(_)) {
    def withNodes(nodeLabelQuery: Query[NodeLabelTable, NodeLabelRow, Seq] = nodeLabels) = for {
      ((nodeLabel, _), node) <- nodeLabelQuery
        .join(nodeNodeLabels).on(_.label === _.nodeLabelLabel)
        .join(nodes).on(_._2.nodeId === _.id)
    } yield (nodeLabel, node)

    def withSourceNode(nodeLabelQuery: Query[NodeLabelTable, NodeLabelRow, Seq] = nodeLabels) =
      for {
        nodeLabel <- nodeLabelQuery
        nodeNodeLabel <- nodeNodeLabels if nodeNodeLabel.nodeLabelLabel === nodeLabel.label
        nodeLabelSource <- nodeLabelSources if nodeLabelSource.nodeLabelLabel === nodeLabel.label
        node <- nodeNodeLabel.node
        source <- nodeLabelSource.source
        nodeSource <- nodeSources if nodeSource.nodeId === node.id
        nodeNodeLabel <- nodeNodeLabel.nodeLabel
        nodeNodeSource <- nodeSource.source
      } yield (nodeLabel, source, node, nodeNodeSource, nodeNodeLabel)
  }
  protected lazy val nodeLabelEdges = TableQuery[NodeLabelEdgeTable]
  protected lazy val nodeLabelEdgeSources = TableQuery[NodeLabelEdgeSourceTable]
  protected lazy val nodeLabelSources = TableQuery[NodeLabelSourceTable]
  protected lazy val nodeNodeLabels = TableQuery[NodeNodeLabelTable]
  protected lazy val nodeSources = TableQuery[NodeSourceTable]
  protected lazy val sources = TableQuery[SourceTable]

  protected lazy val tables =
    List(edges, edgeLabels, edgeSources, nodes, nodeLabels, nodeLabelEdges, nodeLabelEdgeSources, nodeLabelSources, nodeSources, nodeNodeLabels, sources)

  protected lazy val tablesDdlObject = tables.map(_.schema).reduce((left, right) => left ++ right)

  protected final def runTransaction[R](a: DBIOAction[R, NoStream, Effect.All]): Future[R] = {
    db.run(a.transactionally)
  }

  protected final def runSyncTransaction[R](a: DBIOAction[R, NoStream, Effect.All], duration: Duration = Duration.Inf): R = {
    Await.result(runTransaction(a), duration)
  }

  protected final def runSync[R](a: DBIOAction[R, NoStream, Effect.All], duration: Duration = Duration.Inf): R = {
    Await.result(db.run(a), duration)
  }

  protected final case class EdgeRow(id: String, objectNodeId: String, predicate: String, sentences: String, subjectNodeId: String) {
    def toKgEdge(labels: List[String], sourceIds: List[String]) = KgEdge(
      id = id,
      labels = labels,
      `object` = objectNodeId,
      predicate = predicate,
      sentences = sentences.split(SentencesDelimChar).toList,
      sourceIds = sourceIds,
      subject = subjectNodeId
    )
  }
  protected final class EdgeTable(tag: Tag) extends Table[EdgeRow](tag, "edge") {
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

  protected final case class EdgeLabelRow(edgeId: String, label: String)
  protected final class EdgeLabelTable(tag: Tag) extends Table[EdgeLabelRow](tag, "edge_label") {
    def edgeId = column[String]("edge_id")
    def label = column[String]("label")

    def * = (edgeId, label) <> (EdgeLabelRow.tupled, EdgeLabelRow.unapply)

    def edge = foreignKey("edge_fk", edgeId, edges)(_.id)

    def pk = primaryKey("edge_label_pk", (edgeId, label))
  }

  protected final case class EdgeSourceRow(edgeId: String, sourceId: String)
  protected final class EdgeSourceTable(tag: Tag) extends Table[EdgeSourceRow](tag, "edge_x_source") {
    def edgeId = column[String]("edge_id")
    def sourceId = column[String]("source_id")

    def * = (edgeId, sourceId) <> (EdgeSourceRow.tupled, EdgeSourceRow.unapply)

    def edge = foreignKey("edge_fk", edgeId, edges)(_.id)

    def pk = primaryKey("edge_source_pk", (edgeId, sourceId))
  }

  protected final case class NodeRow(id: String, inDegree: Option[Short], outDegree: Option[Short], pageRank: Option[Float], pos: Option[Char], wordNetSenseNumber: Option[Short]) {
    def toKgNode(labels: List[String], sourceIds: List[String]) = KgNode(
      id = id,
      inDegree = inDegree.map(_.toInt),
      labels = labels,
      outDegree = outDegree.map(_.toInt),
      pageRank = pageRank.map(_.toDouble),
      pos = pos,
      sourceIds = sourceIds,
      wordNetSenseNumber = wordNetSenseNumber.map(_.toInt)
    )
  }
  protected final class NodeTable(tag: Tag) extends Table[NodeRow](tag, "node") {
    def id = column[String]("id", O.PrimaryKey)
    def inDegree = column[Option[Short]]("in_degree")
    def outDegree = column[Option[Short]]("out_degree")
    def pageRank = column[Option[Float]]("page_rank")
    def pos = column[Option[Char]]("pos", O.Length(1))
    def wordNetSenseNumber = column[Option[Short]]("word_net_sense_number")

    def * = (id, inDegree, outDegree, pageRank, pos, wordNetSenseNumber) <> (NodeRow.tupled, NodeRow.unapply)
  }

  protected final case class NodeLabelRow(label: String, pageRank: Option[Float]) {
    def toKgNodeLabel(nodes: List[KgNode], sourceIds: List[String]) = KgNodeLabel(
      nodeLabel = label,
      nodes = nodes,
      pageRank = pageRank.map(_.toDouble),
      sourceIds = sourceIds
    )
  }
  protected final class NodeLabelTable(tag: Tag) extends Table[NodeLabelRow](tag, "node_label") {
    def label = column[String]("label", O.PrimaryKey)
    def pageRank = column[Option[Float]]("page_rank")

    def * = (label, pageRank) <> (NodeLabelRow.tupled, NodeLabelRow.unapply)
  }

  protected final case class NodeLabelEdgeRow(objectNodeLabelLabel: String, subjectNodeLabelLabel: String)
  protected final class NodeLabelEdgeTable(tag: Tag) extends Table[NodeLabelEdgeRow](tag, "node_label_edge") {
    def objectNodeLabelLabel = column[String]("object_node_label_label")
    def subjectNodeLabelLabel = column[String]("subject_node_label_label")

    def * = (objectNodeLabelLabel, subjectNodeLabelLabel) <> (NodeLabelEdgeRow.tupled, NodeLabelEdgeRow.unapply)

    def objectNodeLabel = foreignKey("object_node_label_fk", objectNodeLabelLabel, nodeLabels)(_.label)
    def subjectNodeLabel = foreignKey("subject_node_label_fk", subjectNodeLabelLabel, nodeLabels)(_.label)

    def pk = primaryKey("node_label_edge_pk", (objectNodeLabelLabel, subjectNodeLabelLabel))

    def unique_constraint = index("node_label_edge_unique_idx", (objectNodeLabelLabel, subjectNodeLabelLabel), unique = true)
  }

  protected final case class NodeLabelEdgeSourceRow(nodeLabelEdgeObjectNodeLabelLabel: String, nodeLabelEdgeSubjectNodeLabelLabel: String, sourceId: String)
  protected final class NodeLabelEdgeSourceTable(tag: Tag) extends Table[NodeLabelEdgeSourceRow](tag, "node_label_edge_x_source") {
    def nodeLabelEdgeObjectNodeLabelLabel = column[String]("node_node_label_edge_object_node_label_label")
    def nodeLabelEdgeSubjectNodeLabelLabel = column[String]("subject_node_label_edge_subject_node_label_label")
    def sourceId = column[String]("source_id")

    def * = (nodeLabelEdgeObjectNodeLabelLabel, nodeLabelEdgeSubjectNodeLabelLabel, sourceId) <> (NodeLabelEdgeSourceRow.tupled, NodeLabelEdgeSourceRow.unapply)

    def nodeLabelEdge = foreignKey("node_label_edge_fk", (nodeLabelEdgeObjectNodeLabelLabel, nodeLabelEdgeSubjectNodeLabelLabel), nodeLabelEdges)(nodeLabelEdgeTable => (nodeLabelEdgeTable.objectNodeLabelLabel, nodeLabelEdgeTable.subjectNodeLabelLabel))
    def source = foreignKey("source_fk", sourceId, sources)(_.id)

    def pk = primaryKey("node_label_edge_source_pk", (nodeLabelEdgeObjectNodeLabelLabel, nodeLabelEdgeSubjectNodeLabelLabel, sourceId))
  }

  protected final case class NodeLabelSourceRow(nodeLabelLabel: String, sourceId: String)
  protected final class NodeLabelSourceTable(tag: Tag) extends Table[NodeLabelSourceRow](tag, "node_label_x_source") {
    def nodeLabelLabel = column[String]("node_label_label")
    def sourceId = column[String]("source_id")

    def * = (nodeLabelLabel, sourceId) <> (NodeLabelSourceRow.tupled, NodeLabelSourceRow.unapply)

    def nodeLabel = foreignKey("node_label_fk", nodeLabelLabel, nodeLabels)(_.label)
    def source = foreignKey("source_fk", sourceId, sources)(_.id)

    def pk = primaryKey("node_label_source_pk", (nodeLabelLabel, sourceId))
  }

  protected final case class NodeNodeLabelRow(nodeId: String, nodeLabelLabel: String)
  protected final class NodeNodeLabelTable(tag: Tag) extends Table[NodeNodeLabelRow](tag, "node_x_node_label") {
    def nodeId = column[String]("node_id")
    def nodeLabelLabel = column[String]("label")

    def * = (nodeId, nodeLabelLabel) <> (NodeNodeLabelRow.tupled, NodeNodeLabelRow.unapply)

    def node = foreignKey("node_fk", nodeId, nodes)(_.id)
    def nodeLabel = foreignKey("node_label_fk", nodeLabelLabel, nodeLabels)(_.label)

    def pk = primaryKey("node_label_pk", (nodeId, nodeLabelLabel))
  }

  protected final case class NodeSourceRow(nodeId: String, sourceId: String)
  protected final class NodeSourceTable(tag: Tag) extends Table[NodeSourceRow](tag, "node_x_source") {
    def nodeId = column[String]("node_id")
    def sourceId = column[String]("source_id")

    def * = (nodeId, sourceId) <> (NodeSourceRow.tupled, NodeSourceRow.unapply)

    def node = foreignKey("node_fk", nodeId, nodes)(_.id)
    def source = foreignKey("source_fk", sourceId, sources)(_.id)

    def pk = primaryKey("node_source_pk", (nodeId, sourceId))
  }

  protected final case class SourceRow(id: String, label: String) {
    def toKgSource = KgSource(id = id, label = label)
  }
  protected final class SourceTable(tag: Tag) extends Table[SourceRow](tag, "source") {
    def id = column[String]("id", O.PrimaryKey)
    def label = column[String]("label")

    def * = (id, label) <> (SourceRow.tupled, SourceRow.unapply)
  }
}
