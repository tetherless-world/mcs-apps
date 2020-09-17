package io.github.tetherlessworld.mcsapps.lib.kg.stores.neo4j

import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.neo4j.driver.{AuthTokens, GraphDatabase, Session, Transaction}
import io.github.tetherlessworld.mcsapps.lib.kg.stores.Neo4jStoreConfiguration
import scala.collection.JavaConverters._

abstract class AbstractNeo4jKgStore(protected val configuration: Neo4jStoreConfiguration) extends WithResource {
  protected val ListDelimChar = '|'
  protected val ListDelimString = ListDelimChar.toString
  protected val NodeLabel = "Node"
  protected val PathRelationshipType = "PATH"
  protected val SourceLabel = "Source"
  protected val SourceRelationshipType = "SOURCE"
  protected val LabelLabel = "Label"
  protected val LabelRelationshipType = "LABEL"
  protected val LabelEdgeRelationshipType = "LABELEDGE"

  protected val NodeContextTopEdgesLimit = 10
  protected val NodeLabelContextTopEdgesLimit = 10

  private val driver = GraphDatabase.driver(configuration.uri, AuthTokens.basic(configuration.user, configuration.password))

  protected final def toTransactionRunParameters(map: Map[String, Any]) =
    map.asJava.asInstanceOf[java.util.Map[String, Object]]

  protected final def withReadTransaction[V](f: Transaction => V): V =
    withSession { session => {
      session.readTransaction { transaction =>
        f(transaction)
      }
    }
    }

  protected final def withSession[V](f: Session => V): V =
    withResource[Session, V](driver.session())(f)
}
