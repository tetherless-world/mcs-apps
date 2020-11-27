package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import com.google.inject.Inject
import io.github.tetherlessworld.mcsapps.lib.kg.models.edge.KgEdge
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.{KgNode, KgNodeContext, KgNodeLabel, KgNodeLabelContext}
import io.github.tetherlessworld.mcsapps.lib.kg.models.path.KgPath
import io.github.tetherlessworld.mcsapps.lib.kg.models.search.{KgSearchFacets, KgSearchQuery, KgSearchResult, KgSearchSort}
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource
import io.github.tetherlessworld.mcsapps.lib.kg.stores.KgQueryStore
import javax.inject.Singleton
import slick.jdbc.GetResult

import scala.concurrent.ExecutionContext

@Singleton
final class PostgresKgQueryStore @Inject()(configProvider: PostgresStoreConfigProvider)(implicit executionContext: ExecutionContext) extends AbstractPostgresKgStore(configProvider) with KgQueryStore {
  import profile.api._

  private implicit val getStringList = GetResult[List[String]] (r =>
    r.rs.getArray(r.skip.currentPos)
      .getArray
      .asInstanceOf[Array[Any]]
      .toList
      .map(_.toString())
  )

  private implicit val getKgEdge = GetResult(r => KgEdge(
    id = r.<<[String],
    labels = r.<<[List[String]],
    `object` = r.<<[String],
    predicate = r.<<[String],
    sentences = (r.<<[String]).split(SentencesDelimChar).toList,
    sourceIds = r.<<[List[String]],
    subject = r.<<[String]
  ))

  private def toKgNodeLabels(rows: Seq[(NodeLabelRow, String, NodeRow, String, String)]) =
    rows
      .groupBy(_._1.label)
      .values
      .map { rows =>
        rows.head._1.toKgNodeLabel(
          sourceIds = rows.map(_._2).distinct.toList,
          nodes = rows.groupBy(_._3.id).values.map {
            nodeRows =>
              nodeRows.head._3.toKgNode(
                labels = nodeRows.map(_._4).distinct.toList,
                sourceIds = nodeRows.map(_._5).distinct.toList
              )
          }.toList
        )
      }

  override def getNode(id: String): Option[KgNode] = {
    val nodeQuery = nodes.filter(_.id === id)

    val nodeAction = nodes.withLabelSource(nodeQuery).map {
      case (node, nodeLabel, source) => (node, nodeLabel.label, source.id)
    }.result

    runSyncTransaction(nodeAction)
      .groupBy(_._1.id)
      .values
      .map { rows =>
        rows.head._1.toKgNode(
          labels = rows.map(_._2).distinct.toList,
          sourceIds = rows.map(_._3).distinct.toList
        )
      }
      .headOption
  }

  override def getNodeContext(id: String): Option[KgNodeContext] =
    runSyncTransaction(nodes.getById(id)).map { _ =>
      val nodeLabelQuery = for {
        nodeNodeLabel <- nodeNodeLabels if nodeNodeLabel.nodeId === id
        nodeLabel <- nodeNodeLabel.nodeLabel
      } yield (nodeLabel)

      val relatedObjectNodeLabelQuery = (for {
        nodeLabel <- nodeLabelQuery
        relatedObjectNodeLabelEdge <- nodeLabelEdges if relatedObjectNodeLabelEdge.subjectNodeLabelLabel === nodeLabel.label
        relatedObjectNodeLabel <- relatedObjectNodeLabelEdge.objectNodeLabel
      } yield (relatedObjectNodeLabel))

      val relatedSubjectNodeLabelQuery = (for {
        nodeLabel <- nodeLabelQuery
        relatedSubjectNodeLabelEdge <- nodeLabelEdges if relatedSubjectNodeLabelEdge.objectNodeLabelLabel === nodeLabel.label
        relatedSubjectNodeLabel <- relatedSubjectNodeLabelEdge.subjectNodeLabel
      } yield (relatedSubjectNodeLabel))

      val relatedNodeLabelQuery = (relatedObjectNodeLabelQuery ++ relatedSubjectNodeLabelQuery)
      val relatedNodeLabelWithNodeSourceAction = nodeLabels.withSourceNode(relatedNodeLabelQuery).map {
        case (nodeLabel, source, nodeLabelNode, nodeLabelNodeSource, nodeLabelNodeLabel) =>
          (nodeLabel, source.id, nodeLabelNode, nodeLabelNodeLabel.label, nodeLabelNodeSource.id)
      }.result
      
      val relatedNodeLabels = toKgNodeLabels(runSyncTransaction(relatedNodeLabelWithNodeSourceAction)).toList

      // TODO replace inner id order by with pageRank
      val topEdgesQuery =
        sql"""
          SELECT
            e_top.id,
            array_agg(DISTINCT el.label),
            e_top.object_node_id,
            e_outer.predicate,
            e_top.sentences,
            array_agg(DISTINCT s.id),
            e_top.subject_node_id
          FROM edge e_outer
          JOIN LATERAL (
            SELECT * FROM edge e_inner
            WHERE e_inner.subject_node_id = ${id} AND e_inner.predicate = e_outer.predicate
            ORDER BY e_inner.id
            LIMIT #$NodeContextTopEdgesLimit
          ) e_top ON e_outer.subject_node_id = ${id}
          JOIN edge_x_source es ON es.edge_id = e_top.id
          JOIN source s ON s.id = es.source_id
          JOIN edge_label el ON el.edge_id = e_top.id
          GROUP BY e_outer.predicate, e_top.id, e_top.object_node_id, e_top.sentences, e_top.subject_node_id
          ORDER BY e_outer.predicate
           """.as[KgEdge]

      val topEdges = runSyncTransaction(topEdgesQuery).toList

      KgNodeContext(
        topEdges = topEdges,
        relatedNodeLabels = relatedNodeLabels
      )
    }

  override def getNodeLabel(label: String): Option[KgNodeLabel] = {
    val nodeLabelQuery = nodeLabels.filter(_.label === label)

    val nodeLabelAction = nodeLabels.withSourceNode(nodeLabelQuery).map {
      case (nodeLabel, source, nodeLabelNode, nodeLabelNodeSource, nodeLabelNodeLabel) =>
        (nodeLabel, source.id, nodeLabelNode, nodeLabelNodeLabel.label, nodeLabelNodeSource.id)
    }.result

    toKgNodeLabels(runSyncTransaction(nodeLabelAction)).headOption
  }

  override def getNodeLabelContext(label: String): Option[KgNodeLabelContext] = None

  override def getSourcesById: Map[String, KgSource] = {
    runSyncTransaction(sources.result).map(source => (source.id, source.toKgSource)).toMap
  }

  override def getTotalEdgesCount: Int = runSyncTransaction(edges.size.result)

  override def getTotalNodesCount: Int = runSyncTransaction(nodes.size.result)

  override def isEmpty: Boolean = getTotalNodesCount == 0

  override def search(limit: Int, offset: Int, query: KgSearchQuery, sorts: Option[List[KgSearchSort]]): List[KgSearchResult] = List()

  override def searchCount(query: KgSearchQuery): Int = 0

  override def searchFacets(query: KgSearchQuery): KgSearchFacets = KgSearchFacets(List(), List())
}
