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

    private def batchedEdgeInserts(kgEdges: Iterator[KgEdge]) = {
      val stream = kgEdges.toStream
      List(
        edges.insertOrUpdateAll(stream.map(_.toRow)),
        edgeLabels.insertOrUpdateAll(stream.flatMap(edge => edge.labels.map(label => EdgeLabelRow(edge.id, label)))),
        edgeSources.insertOrUpdateAll(stream.flatMap(edge => edge.sourceIds.map(sourceId => EdgeSourceRow(edge.id, sourceId))))
      )
    }

    private def batchedNodeInserts(kgNodes: Iterator[KgNode]) = {
      val stream = kgNodes.toStream
      List(
        nodes.insertOrUpdateAll(stream.map(_.toRow)),
        nodeLabels.insertOrUpdateAll(stream.flatMap(_.labels.map(NodeLabelRow(_, None)))),
        nodeNodeLabels.insertOrUpdateAll(stream.flatMap(node => node.labels.map(label => NodeNodeLabelRow(node.id, label)))),
        nodeLabelSources.insertOrUpdateAll(stream.flatMap(node => node.labels.flatMap(label => node.sourceIds.map(NodeLabelSourceRow(label, _))))),
        nodeSources.insertOrUpdateAll(stream.flatMap(node => node.sourceIds.map(NodeSourceRow(node.id, _))))
      )
    }

    private def batchedSourceInserts(kgSources: Iterator[KgSource]) =
      List(sources.insertOrUpdateAll(kgSources.map(_.toRow).toIterable))

    override final def clear(): Unit = {
      val tableNames = tables.map(_.baseTableRow.tableName).mkString(",")
      runSyncTransaction(sqlu"TRUNCATE #$tableNames;")
    }

    override final def close(): Unit = {
      runSyncTransaction(DBIO.seq(
        writeNodeLabelEdgesAction,
        writeNodeLabelEdgeSourcesAction
      ))
    }

    override final def putData(data: KgData) =
      runSyncTransaction(
        DBIO.sequence(
          batchedSourceInserts(data.sources.iterator) ++
          batchedNodeInserts(data.nodesUnranked.iterator) ++
          batchedEdgeInserts(data.edges.iterator)
        )
      )

    override final def putEdges(kgEdges: Iterator[KgEdge]) =
      runSyncTransaction(DBIO.sequence(batchedEdgeInserts(kgEdges)))

    override final def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes]): Unit =
      runSyncTransaction(DBIO.sequence(
        batchedNodeInserts(edgesWithNodes.flatMap(_.nodes)) ++
        batchedEdgeInserts(edgesWithNodes.map(_.edge))
      ))

    override final def putNodes(nodes: Iterator[KgNode]): Unit =
      runSyncTransaction(DBIO.sequence(batchedNodeInserts(nodes)))

    override final def putPaths(paths: Iterator[KgPath]): Unit = Unit

    override final def putSources(sources: Iterator[KgSource]): Unit =
      runSyncTransaction(DBIO.sequence(batchedSourceInserts(sources)))

    private def writeNodeLabelEdgesAction = {
      val nodeLabelEdgePairsAction = (for {
        (subjectNodeLabel, node) <- nodeLabels.withNodes
        edge <- edges if edge.subjectNodeId === node.id
        objectNode <- edge.objectNode
        objectNodeNodeLabel <- nodeNodeLabels if objectNodeNodeLabel.nodeId === objectNode.id && objectNodeNodeLabel.nodeLabelLabel =!= subjectNodeLabel.label
        objectNodeLabel <- objectNodeNodeLabel.nodeLabel
      } yield (subjectNodeLabel.label, objectNodeLabel.label)).result

      for {
        nodeLabelEdgePairs <- nodeLabelEdgePairsAction
        _ <- nodeLabelEdges ++= nodeLabelEdgePairs.distinct.map { case (objectNodeLabelLabel, subjectNodeLabelLabel) =>
          NodeLabelEdgeRow(objectNodeLabelLabel, subjectNodeLabelLabel)
        }
      } yield ()
    }

    private def writeNodeLabelEdgeSourcesAction = {
      val objectNodeLabelEdgeSourcesQuery = for {
        nodeLabelEdge <- nodeLabelEdges
        objectNodeLabel <- nodeLabelEdge.objectNodeLabel
        objectNodeLabelSourceSource <- nodeLabelSources if objectNodeLabelSourceSource.nodeLabelLabel === objectNodeLabel.label
        objectNodeLabelSource <- objectNodeLabelSourceSource.source
      } yield (nodeLabelEdge.objectNodeLabelLabel, nodeLabelEdge.subjectNodeLabelLabel, objectNodeLabelSource.id)

      val subjectNodeLabelEdgeSourcesQuery = for {
        nodeLabelEdge <- nodeLabelEdges
        subjectNodeLabel <- nodeLabelEdge.subjectNodeLabel
        subjectNodeLabelSourceSource <- nodeLabelSources if subjectNodeLabelSourceSource.nodeLabelLabel === subjectNodeLabel.label
        subjectNodeLabelSource <- subjectNodeLabelSourceSource.source
      } yield (nodeLabelEdge.objectNodeLabelLabel, nodeLabelEdge.subjectNodeLabelLabel, subjectNodeLabelSource.id)

      val nodeLabelEdgeSourcesAction = (objectNodeLabelEdgeSourcesQuery ++ subjectNodeLabelEdgeSourcesQuery).result

      for {
        nodeLabelEdgeSourcesResult <- nodeLabelEdgeSourcesAction
        _ <- nodeLabelEdgeSources.insertOrUpdateAll(nodeLabelEdgeSourcesResult.map {
          case (edgeObjectLabel, edgeSubjectLabel, sourceId) => NodeLabelEdgeSourceRow(edgeObjectLabel, edgeSubjectLabel, sourceId)
        })
      } yield ()
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
