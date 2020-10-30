package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import com.google.inject.Inject
import io.github.tetherlessworld.mcsapps.lib.kg.models.node.{KgNode, KgNodeContext, KgNodeLabel, KgNodeLabelContext}
import io.github.tetherlessworld.mcsapps.lib.kg.models.path.KgPath
import io.github.tetherlessworld.mcsapps.lib.kg.models.search.{KgSearchFacets, KgSearchQuery, KgSearchResult, KgSearchSort}
import io.github.tetherlessworld.mcsapps.lib.kg.models.source.KgSource
import io.github.tetherlessworld.mcsapps.lib.kg.stores.KgQueryStore
import javax.inject.Singleton
import play.api.db.slick.DatabaseConfigProvider

import scala.concurrent.ExecutionContext

@Singleton
final class PostgresKgQueryStore @Inject()(dbConfigProvider: DatabaseConfigProvider)(implicit executionContext: ExecutionContext) extends AbstractPostgresKgStore(dbConfigProvider) with KgQueryStore {
  import profile.api._

  override def getNode(id: String): Option[KgNode] = {
    runSyncTransaction((for { node <- nodes if node.id === id } yield node).result.headOption)
  }

  override def getNodeContext(id: String): Option[KgNodeContext] = None

  override def getNodeLabel(label: String): Option[KgNodeLabel] = None

  override def getNodeLabelContext(label: String): Option[KgNodeLabelContext] = None

  override def getPath(id: String): Option[KgPath] = None

  override def getRandomNode: KgNode = KgNode("", None, List(), None, None, None, List(), None)

  override def getSourcesById: Map[String, KgSource] = Map()

  override def getTotalEdgesCount: Int = 0

  override def getTotalNodesCount: Int = 0

  override def isEmpty: Boolean = true

  override def search(limit: Int, offset: Int, query: KgSearchQuery, sorts: Option[List[KgSearchSort]]): List[KgSearchResult] = List()

  override def searchCount(query: KgSearchQuery): Int = 0

  override def searchFacets(query: KgSearchQuery): KgSearchFacets = KgSearchFacets(List(), List())
}
