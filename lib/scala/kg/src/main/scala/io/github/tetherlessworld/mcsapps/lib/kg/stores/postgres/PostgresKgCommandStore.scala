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
      def toRow: KgEdgeRow = KgEdgeRow(
        id = edge.id,
        objectKgNodeId = edge.`object`,
        predicate = edge.predicate,
        sentences = edge.sentences.mkString(SentencesDelimString),
        subjectKgNodeId = edge.subject
      )
    }

    private final implicit class KgNodeWrapper(node: KgNode) {
      def toRow: KgNodeRow = KgNodeRow(
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

    final private def generateEdgeInsert(edge: KgEdge) =
      List(kgEdges += edge.toRow) ++
        edge.labels.map(label => kgEdgeLabels += (edge.id, label)) ++
        edge.sourceIds.map(sourceId => kgEdgeKgSources += (edge.id, sourceId))

    final private def generateNodeInsert(node: KgNode) =
      List(kgNodes += node.toRow) ++
        node.labels.map(label => kgNodeKgNodeLabels += (node.id, label)) ++
        node.sourceIds.map(sourceId => kgNodeKgSources += (node.id, sourceId))

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

    override def putPaths(paths: Iterator[KgPath]): Unit = {
//      TODO
    }

    override def putSources(sources: Iterator[KgSource]): Unit =
      runSyncTransaction(DBIO.sequence(sources.map { source =>
        kgSources += (source.id, source.label)
      }))

    override def close(): Unit = Unit
  }

  override def beginTransaction: KgCommandStoreTransaction =
    new PostgresKgCommandStoreTransaction
}
