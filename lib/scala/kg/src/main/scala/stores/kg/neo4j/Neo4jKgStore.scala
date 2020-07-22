package stores.kg.neo4j

import com.google.inject.Inject
import formats.kg.kgtk.KgtkEdgeWithNodes
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import javax.inject.Singleton
import models.kg.{KgEdge, KgNode, KgPath, KgSource}
import org.neo4j.driver._
import org.slf4j.LoggerFactory
import stores.kg.{KgNodeFilters, KgStore}
import stores.{Neo4jStoreConfiguration, StringFilter}

import scala.collection.JavaConverters._
import scala.collection.mutable



@Singleton
final class Neo4jKgStore @Inject()(configuration: Neo4jStoreConfiguration) extends KgStore with WithResource {
  private var bootstrapped: Boolean = false
  private val driver = GraphDatabase.driver(configuration.uri, AuthTokens.basic(configuration.user, configuration.password))
  private val logger = LoggerFactory.getLogger(getClass)

  private implicit class Neo4jKgStoreTransactionWrapperImplicit(transaction: Transaction) extends Neo4jKgStoreTransactionWrapper(configuration, transaction)

  bootstrapStore()

  private def bootstrapStore(): Unit = {
    this.synchronized {
      if (bootstrapped) {
        return
      }

      withSession { session =>
        val hasConstraints =
          session.readTransaction { transaction =>
            val result =
              transaction.run("CALL db.constraints")
            result.hasNext
          }

        if (hasConstraints) {
          logger.info("neo4j indices already exist")
          bootstrapped = true
          return
        }

        logger.info("bootstrapping neo4j indices")

        val bootstrapCypherStatements = List(
          """CALL db.index.fulltext.createNodeIndex("node",["Node"],["id", "labels", "sources"]);""",
          """CREATE CONSTRAINT node_id_constraint ON (node:Node) ASSERT node.id IS UNIQUE;""",
          """CREATE CONSTRAINT source_id_constraint ON (source:Source) ASSERT source.id IS UNIQUE;"""
        )

        session.writeTransaction { transaction =>
          for (bootstrapCypherStatement <- bootstrapCypherStatements) {
            transaction.run(bootstrapCypherStatement)
          }
          transaction.commit()
        }
      }

      logger.info("bootstrapped neo4j indices")
    }
  }

  final def clear(): Unit = {
    // It would be simpler to use CREATE OR REPLACE DATABASE, but the free Neo4j 4.0 Community Edition doesn't support it,
    // and the open source fork of the Neo4j Enterprise Edition doesn't include 4.0 features yet.
    withWriteTransaction { transaction =>
      transaction.clear()
      transaction.commit()
    }
    while (!isEmpty) {
      logger.info("waiting for neo4j to clear")
      Thread.sleep(100)
    }
  }

  final override def getSourcesById: Map[String, KgSource] =
    withReadTransaction { transaction =>
      transaction.getSourcesById
    }

  override final def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[KgEdge] =
    withReadTransaction { transaction =>
      transaction.getEdgesByObject(limit, objectNodeId, offset)
    }

  override final def getEdgesBySubject(limit: Int, offset: Int, subjectNodeId: String): List[KgEdge] =
    withReadTransaction { transaction =>
      transaction.getEdgesBySubject(limit, offset, subjectNodeId)
    }

  final override def getMatchingNodes(filters: Option[KgNodeFilters], limit: Int, offset: Int, text: Option[String]): List[KgNode] =
    withReadTransaction { transaction =>
      transaction.getMatchingNodes(filters, limit, offset, text)
    }

  final override def getMatchingNodesCount(filters: Option[KgNodeFilters], text: Option[String]): Int =
    withReadTransaction { transaction =>
      transaction.getMatchingNodesCount(filters, text)
    }

  override final def getNodeById(id: String): Option[KgNode] =
    withReadTransaction { transaction =>
      transaction.getNodeById(id)
    }

  //  override def getPaths: List[KgPath] =
  //    withSession { session =>
  //      session.readTransaction { transaction =>
  //        transaction.run(
  //          s"""MATCH (subjectNode:Node)-[path:PATH]->(objectNode:Node)
  //            |RETURN objectNode.id, subjectNode.id, ${pathPropertyNamesString}
  //            |""".stripMargin
  //        ).toPaths
  //      }
  //    }
  //
  override def getPathById(id: String): Option[KgPath] =
    withReadTransaction { transaction =>
      transaction.getPathById(id)
    }

  final override def getRandomNode: KgNode =
    withReadTransaction { transaction =>
      transaction.getRandomNode
    }

  final override def getTotalEdgesCount: Int =
    withReadTransaction { transaction =>
      transaction.getTotalEdgesCount
    }

  final override def getTotalNodesCount: Int =
    withReadTransaction { transaction =>
      transaction.getTotalNodesCount
    }

  final override def isEmpty: Boolean =
    withReadTransaction { transaction =>
      transaction.isEmpty
    }

  final override def putEdges(edges: Iterator[KgEdge]): Unit =
    withWriteTransaction { transaction =>
      transaction.putEdges(edges)
    }

  final override def putKgtkEdgesWithNodes(edgesWithNodes: Iterator[KgtkEdgeWithNodes]): Unit =
    withWriteTransaction { transaction =>
      transaction.putKgtkEdgesWithNodes(edgesWithNodes)
    }

  final override def putNodes(nodes: Iterator[KgNode]): Unit =
    withWriteTransaction { transaction =>
      transaction.putNodes(nodes)
    }

  final override def putPaths(paths: Iterator[KgPath]): Unit =
    withWriteTransaction { transaction =>
      transaction.putPaths(paths)
    }

  final override def putSources(sources: Iterator[KgSource]): Unit =
    withWriteTransaction { transaction =>
      transaction.putSources(sources)
    }

  private def withReadTransaction[V](f: Transaction => V): V =
    withSession { session => {
      session.readTransaction { transaction =>
        f(transaction)
      }
    }
    }

  private def withSession[V](f: Session => V): V =
    withResource[Session, V](driver.session())(f)

  private def withWriteTransaction[V](f: Transaction => V): V =
    withSession { session => {
      session.writeTransaction { transaction =>
        f(transaction)
      }
    }
    }
}

object Neo4jKgStore {
  final val ListDelimChar = '|'
}
