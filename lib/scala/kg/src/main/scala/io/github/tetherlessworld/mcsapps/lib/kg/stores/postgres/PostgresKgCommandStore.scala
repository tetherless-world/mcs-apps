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
        nodeLabels.insertOrUpdateAll(stream.flatMap(_.labels.map(NodeLabelRow(None, _, None, None)))),
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
        writeNodeLabelEdgeSourcesAction,
      ))

      writeNodePageRank()
      writeNodeLabelPageRank()
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

    override final def putSources(sources: Iterator[KgSource]): Unit =
      runSyncTransaction(DBIO.sequence(batchedSourceInserts(sources)))

    private def writeNodePageRank(convergenceThreshold: Double = 0.0000001, dampingFactor: Double = 0.85, maxIterations: Int = 20): Unit = {
      val numNodesAction = nodes.size.result
//      Initialize node page ranks to 1/n where n is the number of nodes
      val initializeNodePageRanksAction = numNodesAction.flatMap {
        case (numNodes) => nodes.map(_.pageRank).update(Some((1.0 / numNodes).toFloat))
      }
//      Initialize node in/out degrees and page ranks
      val numNodes = runSyncTransaction(DBIO.sequence(List(initializeNodePageRanksAction, writeNodeDegreesAction)))(0)

      if (numNodes == 0) {
        return
      }

      for (_ <- 1 to maxIterations) {
//        intellij shows writeNodePageRankAction returning a List[Double] but for some
//         reason sbt compiles it as returning List[Any] so forced to convert to Double
//        Update node page ranks and retrieve page rank delta value
        val delta = runSyncTransaction(writeNodePageRankAction(dampingFactor.toFloat))(1).asInstanceOf[Number].doubleValue

//        If page rank has converged, exit
        if (delta < convergenceThreshold) {
          return
        }
      }
    }

    private def writeNodeLabelPageRank(convergenceThreshold: Double = 0.0000001, dampingFactor: Double = 0.85, maxIterations: Int = 20): Unit = {
      val numNodeLabelsAction = nodeLabels.size.result
      val initializeNodeLabelPageRanksAction = numNodeLabelsAction.flatMap {
        case (numNodes) => nodes.map(_.pageRank).update(Some((1.0 / numNodes).toFloat))
      }
      val numNodes = runSyncTransaction(DBIO.sequence(List(initializeNodeLabelPageRanksAction, writeNodeLabelDegreesAction)))(0)

      if (numNodes == 0) {
        return
      }

      for (_ <- 1 to maxIterations) {
        val delta = runSyncTransaction(writeNodeLabelPageRankAction(dampingFactor.toFloat))(1).asInstanceOf[Number].doubleValue

        if (delta < convergenceThreshold) {
          return
        }
      }
    }

    private def writeNodePageRankAction(dampingFactor: Float) = {
      val temporaryTableName = "temp_node_page_rank"
      DBIO.sequence(List(
        // Calculates new page rank for each node and saves in a temporary table
        sqlu"""
            SELECT n.id as node_id, ${dampingFactor} * sum(n_neighbor.page_rank / n.out_degree) + (1 - ${dampingFactor}) as page_rank
            INTO #$temporaryTableName
            FROM node n
            JOIN edge e
            ON e.object_node_id = n.id
            JOIN node n_neighbor
            ON n_neighbor.id = e.subject_node_id
            GROUP BY n.id
          """,
        // Check if page rank has converged by calculating the difference
        //  between the new page ranks and the current page ranks
        sql"""
           SELECT sqrt(sum((new.page_rank - cur.page_rank)^2))
           FROM #$temporaryTableName new
           JOIN node cur
           ON cur.id = new.node_id
         """.as[Double].head,
        // Update the nodes with the new page ranks
        sqlu"""
            UPDATE node
            SET
              page_rank = new.page_rank
            FROM #$temporaryTableName new
            WHERE node.id = new.node_id
          """,
        // Drop the table
        sqlu"DROP TABLE #$temporaryTableName"
      ))
    }

    private def writeNodeLabelPageRankAction(dampingFactor: Float) = {
      val temporaryTableName = "temp_node_label_page_rank"
      DBIO.sequence(List(
        sqlu"""
            SELECT nl.label as label, ${dampingFactor} * sum(nl_neighbor.page_rank / nl.out_degree) + (1 - ${dampingFactor}) as page_rank
            INTO #$temporaryTableName
            FROM node_label nl
            JOIN node_label_edge e
            ON e.object_node_label_label = nl.label
            JOIN node_label nl_neighbor
            ON nl_neighbor.label = e.subject_node_label_label
            GROUP BY nl.label
          """,
        sql"""
           SELECT sqrt(sum((new.page_rank - cur.page_rank)^2))
           FROM #$temporaryTableName new
           JOIN node_label cur
           ON cur.label = new.label
         """.as[Double].head,
        sqlu"""
            UPDATE node_label
            SET
              page_rank = new.page_rank
            FROM #$temporaryTableName new
            WHERE node.label = new.label
          """,
        sqlu"DROP TABLE #$temporaryTableName"
      ))
    }

    private def writeNodeDegreesAction = {
      sqlu"""
        UPDATE node
        SET
          in_degree = in_edge.degree,
          out_degree = out_edge.degree
        FROM node n
        JOIN (
          SELECT n.id AS id, count(e.id) AS degree FROM node n
          LEFT JOIN edge e ON e.subject_node_id = n.id
          GROUP BY n.id
        ) as out_edge on out_edge.id = n.id
        JOIN (
          SELECT n.id AS id, count(e.id) AS degree FROM node n
          LEFT JOIN edge e ON e.object_node_id = n.id
          GROUP BY n.id
        ) as in_edge ON in_edge.id = n.id
        WHERE node.id = n.id;
          """
    }

    private def writeNodeLabelDegreesAction = {
      sqlu"""
        UPDATE node_label
        SET
          in_degree = in_edge.degree,
          out_degree = out_edge.degree
        FROM node_label nl
        JOIN (
          SELECT subject_node_label_label as label, count(*) AS degree
          FROM node_label_edge e
          GROUP BY e.subject_node_label_label
        ) as out_edge on out_edge.label = nl.label
        JOIN (
          SELECT object_node_label_label as label, count(*) AS degree
          FROM node_label_edge e
          GROUP BY e.object_node_label_label
        ) as in_edge on in_edge.label = nl.label
        WHERE node_label.label = nl.label;
          """
    }

    private def writeNodeLabelEdgesAction = {
      val nodeLabelEdgePairsAction = (for {
        (subjectNodeLabel, node) <- nodeLabels.withNodes()
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
