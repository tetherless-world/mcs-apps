package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import com.google.inject.{Inject, Singleton}
import io.github.tetherlessworld.mcsapps.lib.kg.data.KgData
import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.{KgNode, KgNodeLabel}
import io.github.tetherlessworld.mcsapps.lib.kg.models.path.KgPath
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource
import io.github.tetherlessworld.mcsapps.lib.kg.stores.{KgCommandStore, KgCommandStoreTransaction}
import org.slf4j.LoggerFactory

import scala.concurrent.ExecutionContext

@Singleton
class PostgresKgCommandStore @Inject()(configProvider: PostgresStoreConfigProvider)(implicit executionContext: ExecutionContext) extends AbstractPostgresKgStore(configProvider) with KgCommandStore {
  import profile.api._

  private var bootstrapped: Boolean = false
  private val logger = LoggerFactory.getLogger(getClass)

  private class PostgresKgCommandStoreTransaction extends KgCommandStoreTransaction {
    private implicit class KgEdgeWrapper(edge: KgEdge) {
      def toRow: EdgeRow = EdgeRow(
        id = edge.id,
        objectNodeId = edge.`object`,
        predicate = edge.predicate,
        sentences = edge.sentences.mkString(SentencesDelimString),
        subjectNodeId = edge.subject
      )
    }

    private implicit class KgNodeWrapper(node: KgNode) {
      def toRow: NodeRow = NodeRow(
        id = node.id,
        inDegree = node.inDegree.map(_.toShort),
        outDegree = node.outDegree.map(_.toShort),
        pageRank = node.pageRank.map(_.toFloat),
        pos = node.pos,
        wordNetSenseNumber = node.wordNetSenseNumber.map(_.toShort)
      )
    }

    private implicit class KgSourceWrapper(source: KgSource) {
      def toRow: SourceRow = SourceRow(
        id = source.id,
        label = source.label
      )
    }

    override final def clear(): Unit = {
      val tableNames = tables.map(_.baseTableRow.tableName).mkString(",")
      runSyncTransaction(sqlu"TRUNCATE #$tableNames;")
    }

    override final def close(): Unit = {
      writeNodeLabelEdges
      writeNodeLabelEdgeSources
    }

    private def generateEdgeInsert(edge: KgEdge) =
      List(edges.insertOrUpdate(edge.toRow)) ++
        edge.labels.map(label => edgeLabels.insertOrUpdate((edge.id, label))) ++
        edge.sourceIds.map(sourceId => edgeSources.insertOrUpdate((edge.id, sourceId)))

    private def generateNodeInsert(node: KgNode) =
      List(nodes.insertOrUpdate(node.toRow)) ++
        node.labels.flatMap { label =>
          List(
            nodeLabels.insertOrUpdate(NodeLabelRow(label, None)),
            nodeNodeLabels.insertOrUpdate((node.id, label))
          ) ++ node.sourceIds.map(
            sourceId => nodeLabelSources.insertOrUpdate((label, sourceId))
          )
        } ++
        node.sourceIds.map(sourceId => nodeSources.insertOrUpdate((node.id, sourceId)))

    private def generateSourceInsert(source: KgSource) =
      List(sources.insertOrUpdate(source.toRow))

    override final def putData(data: KgData) =
      runSyncTransaction(DBIO.sequence(
        data.sources.flatMap(generateSourceInsert) ++
        data.nodesUnranked.flatMap(generateNodeInsert) ++
        data.edges.flatMap(generateEdgeInsert)
      ))

    override final def putEdges(edges: Iterator[KgEdge]) =
      runSyncTransaction(DBIO.sequence(edges.flatMap(generateEdgeInsert)))

    override final def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes]): Unit =
      runSyncTransaction(DBIO.sequence(
        edgesWithNodes.flatMap { edge =>
          edge.nodes.flatMap(generateNodeInsert) ++
          generateEdgeInsert(edge.edge)
        }
      ))

    override final def putNodes(nodes: Iterator[KgNode]): Unit =
      runSyncTransaction(DBIO.sequence(nodes.flatMap(generateNodeInsert)))

    override final def putPaths(paths: Iterator[KgPath]): Unit = Unit

    override final def putSources(sources: Iterator[KgSource]): Unit =
      runSyncTransaction(DBIO.sequence(sources.flatMap(generateSourceInsert)))

    private def writeNodeLabelEdges: Unit = {
      val nodeLabelEdgeNodeLabelsQuery = (for {
        edge <- edges
        objectNode <- edge.objectNode
        subjectNode <- edge.subjectNode
        objectNodeNodeLabel <- nodeNodeLabels if objectNodeNodeLabel.nodeId === objectNode.id
        subjectNodeNodeLabel <- nodeNodeLabels if subjectNodeNodeLabel.nodeId === subjectNode.id
        objectNodeLabel <- objectNodeNodeLabel.nodeLabel
        subjectNodeLabel <- subjectNodeNodeLabel.nodeLabel
      } yield (objectNodeLabel.label, subjectNodeLabel.label)).result

      val nodeLabelEdgeInserts = runSyncTransaction(nodeLabelEdgeNodeLabelsQuery).map {
        case (objectNodeLabelLabel, subjectNodeLabelLabel) =>
          sqlu"INSERT INTO #${nodeLabelEdges.baseTableRow.tableName} (object_node_label_label, subject_node_label_label) VALUES ($objectNodeLabelLabel, $subjectNodeLabelLabel) ON CONFLICT DO NOTHING;"
      }

      runSyncTransaction(DBIO.sequence(nodeLabelEdgeInserts))
    }

    private def writeNodeLabelEdgeSources: Unit = {
      val objectNodeLabelEdgeSourcesQuery = (for {
        nodeLabelEdge <- nodeLabelEdges
        objectNodeLabel <- nodeLabelEdge.objectNodeLabel
        objectNodeLabelSourceSource <- nodeLabelSources if objectNodeLabelSourceSource.nodeLabelLabel === objectNodeLabel.label
        objectNodeLabelSource <- objectNodeLabelSourceSource.source
      } yield (nodeLabelEdge.id, objectNodeLabelSource.id))

      val subjectNodeLabelEdgeSourcesQuery = (for {
        nodeLabelEdge <- nodeLabelEdges
        subjectNodeLabel <- nodeLabelEdge.subjectNodeLabel
        subjectNodeLabelSourceSource <- nodeLabelSources if subjectNodeLabelSourceSource.nodeLabelLabel === subjectNodeLabel.label
        subjectNodeLabelSource <- subjectNodeLabelSourceSource.source
      } yield (nodeLabelEdge.id, subjectNodeLabelSource.id))

      val nodeLabelEdgeSourcesAction = (objectNodeLabelEdgeSourcesQuery ++ subjectNodeLabelEdgeSourcesQuery).result

      runSyncTransaction(for {
        nodeLabelEdgeSourcesResult <- nodeLabelEdgeSourcesAction
        _ <- nodeLabelEdgeSources.insertOrUpdateAll(nodeLabelEdgeSourcesResult)
      } yield ())
    }
  }

  bootstrapStore()

  private def bootstrapStore(): Unit = {
    this.synchronized {
      if (bootstrapped) {
        logger.info("Postgres store already bootstrapped, skipping...")
        return
      }

      val tableCount = runSyncTransaction(sql"SELECT COUNT(table_name) FROM information_schema.tables WHERE table_schema='public'".as[Int].head)

      if (tableCount != 0) {
        logger.info("Postgres database tables already created, skipping bootstrap...")
        return
      }

      runSyncTransaction(tablesDdlObject.create)

      bootstrapped = true
      logger.info("Postgres store bootstrapped")
    }
  }

  override final def beginTransaction: KgCommandStoreTransaction =
    new PostgresKgCommandStoreTransaction
}
