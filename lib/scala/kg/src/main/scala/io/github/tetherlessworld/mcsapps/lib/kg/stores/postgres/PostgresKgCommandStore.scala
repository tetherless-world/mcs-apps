package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import com.google.inject.Inject
import io.github.tetherlessworld.mcsapps.lib.kg.formats.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.KgNode
import io.github.tetherlessworld.mcsapps.lib.kg.models.path.KgPath
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource
import io.github.tetherlessworld.mcsapps.lib.kg.stores.{KgCommandStore, KgCommandStoreTransaction}
import play.api.db.slick.DatabaseConfigProvider

import scala.concurrent.ExecutionContext

class PostgresKgCommandStore @Inject()(dbConfigProvider: DatabaseConfigProvider)(implicit executionContext: ExecutionContext) extends AbstractPostgresKgStore(dbConfigProvider) with KgCommandStore {
  import profile.api._

  private final class PostgresKgCommandStoreTransaction extends KgCommandStoreTransaction {
    private final implicit class KgEdgeWrapper(edge: KgEdge) {
      def toRow: EdgeRow = EdgeRow(
        id = edge.id,
        objectNodeId = edge.`object`,
        predicate = edge.predicate,
        sentences = edge.sentences.mkString(SentencesDelimString),
        subjectNodeId = edge.subject
      )
    }

    private final implicit class KgNodeWrapper(node: KgNode) {
      def toRow: NodeRow = NodeRow(
        id = node.id,
        inDegree = node.inDegree.map(_.toShort),
        outDegree = node.outDegree.map(_.toShort),
        pageRank = node.pageRank.map(_.toFloat),
        pos = node.pos,
        wordNetSenseNumber = node.wordNetSenseNumber.map(_.toShort)
      )
    }

    override def clear(): Unit = {
//      TODO
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

    override def putEdges(edges: Iterator[KgEdge]) =
      runSyncTransaction(DBIO.sequence(edges.flatMap(generateEdgeInsert)))

    override def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes]): Unit =
      runSyncTransaction(DBIO.sequence(
        edgesWithNodes.flatMap { edge =>
          edge.nodes.flatMap(generateNodeInsert) ++
          generateEdgeInsert(edge.edge)
        }
      ))

    override def putNodes(nodes: Iterator[KgNode]): Unit =
      runSyncTransaction(DBIO.sequence(nodes.flatMap(generateNodeInsert)))

    override def putPaths(paths: Iterator[KgPath]): Unit = Unit

    override def putSources(sources: Iterator[KgSource]): Unit =
      runSyncTransaction(DBIO.sequence(sources.flatMap(generateSourceInsert)))

    override def close(): Unit = Unit
  }

  override def beginTransaction: KgCommandStoreTransaction =
    new PostgresKgCommandStoreTransaction
}
