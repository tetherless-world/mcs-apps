package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import com.google.inject.{Inject, Singleton}
import io.github.tetherlessworld.mcsapps.lib.kg.data.KgData
import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.KgNode
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

    override final def clear(): Unit = {
      runSyncTransaction(tablesDdlObject.truncate)
    }

    private def generateEdgeInsert(edge: KgEdge) =
      List(edges += edge.toRow) ++
        edge.labels.map(label => edgeLabels += (edge.id, label)) ++
        edge.sourceIds.map(sourceId => edgeSources += (edge.id, sourceId))

    private def generateNodeInsert(node: KgNode) =
      List(nodes += node.toRow) ++
        node.labels.map(label => nodeNodeLabels += (node.id, label)) ++
        node.sourceIds.map(sourceId => nodeSources += (node.id, sourceId))

    private def generateSourceInsert(source: KgSource) =
      List(sources += (source.id, source.label))

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

    override final def close(): Unit = Unit
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
