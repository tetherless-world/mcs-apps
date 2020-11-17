package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import com.google.inject.Inject
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.{KgNode, KgNodeContext, KgNodeLabel, KgNodeLabelContext}
import io.github.tetherlessworld.mcsapps.lib.kg.models.path.KgPath
import io.github.tetherlessworld.mcsapps.lib.kg.models.search.{KgSearchFacets, KgSearchQuery, KgSearchResult, KgSearchSort}
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource
import io.github.tetherlessworld.mcsapps.lib.kg.stores.KgQueryStore
import javax.inject.Singleton

import scala.concurrent.ExecutionContext

@Singleton
final class PostgresKgQueryStore @Inject()(configProvider: PostgresStoreConfigProvider)(implicit executionContext: ExecutionContext) extends AbstractPostgresKgStore(configProvider) with KgQueryStore {
  import profile.api._

  override def getNode(id: String): Option[KgNode] = {
    val query = (for {
      ((node, source), (_, nodeLabel)) <- nodes
        .withSources
        .join(nodes.withNodeLabels)
        .on(_._1.id === _._1.id)
        .filter(_._1._1.id === id)
    } yield (node, nodeLabel.label, source.id)).result

    runSyncTransaction(query)
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

  override def getNodeContext(id: String): Option[KgNodeContext] = None

  override def getNodeLabel(label: String): Option[KgNodeLabel] = {
    val query = (for {
      nodeLabel <- nodeLabels if nodeLabel.label === label
      nodeNodeLabel <- nodeNodeLabels if nodeNodeLabel.nodeLabelLabel === nodeLabel.label
      nodeLabelSource <- nodeLabelSources if nodeLabelSource.nodeLabelLabel === nodeLabel.label
      node <- nodeNodeLabel.node
      source <- nodeLabelSource.source
      nodeSource <- nodeSources if nodeSource.nodeId === node.id
      nodeNodeLabel <- nodeNodeLabel.nodeLabel
      nodeNodeSource <- nodeSource.source
    } yield (nodeLabel, source.id, node, nodeNodeSource.id, nodeNodeLabel.label)).result

    runSyncTransaction(query)
      .groupBy(_._1.label)
      .values
      .map {
        rows => rows.head._1.toKgNodeLabel(
          sourceIds = rows.map(_._2).distinct.toList,
          nodes = rows.groupBy(_._3.id).values.map {
            nodeRows => nodeRows.head._3.toKgNode(
              labels = nodeRows.map(_._4).distinct.toList,
              sourceIds = nodeRows.map(_._5).distinct.toList
            )
          }.toList
        )
      }
      .headOption
  }

  override def getNodeLabelContext(label: String): Option[KgNodeLabelContext] = None

  override def getPath(id: String): Option[KgPath] = None

  override def getRandomNode: KgNode = KgNode("", None, List(), None, None, None, List(), None)

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
