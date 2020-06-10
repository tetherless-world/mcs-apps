package stores
import java.util

import com.google.inject.Inject
import javax.inject.Singleton
import models.cskg.{Edge, Node}
import models.path.Path
import org.neo4j.driver.{AuthTokens, GraphDatabase, Record, Result, Session, Transaction, Values}
import org.slf4j.LoggerFactory

import scala.io.Source
import scala.collection.JavaConverters._

final case class CypherBinding(variableName: String, value: Any)
final case class CypherFilter(cypher: String, binding: Option[CypherBinding] = None)
final case class CypherFilters(filters: List[CypherFilter]) {
  def toCypherBindingsMap: Map[String, Any] =
    filters.flatMap(filter => filter.binding).map(binding => (binding.variableName -> binding.value)).toMap

  def toCypherString: String =
    if (!filters.isEmpty) {
      s"WHERE ${filters.map(filter => filter.cypher).mkString(" AND ")}"
    } else {
      ""
    }
}
object CypherFilters {
  def apply(nodeFilters: Option[NodeFilters]): CypherFilters =
    if (nodeFilters.isDefined) {
      apply(nodeFilters.get)
    } else {
      CypherFilters(List())
    }

  def apply(nodeFilters: NodeFilters): CypherFilters =
    if (nodeFilters.datasource.isDefined) {
      CypherFilters(toCypherFilters(bindingVariableNamePrefix = "nodeDatasource", property = "node.datasource", stringFilter = nodeFilters.datasource.get))
    } else {
      CypherFilters(List())
    }

  private def toCypherFilters(bindingVariableNamePrefix: String, property: String, stringFilter: StringFilter): List[CypherFilter] = {
    stringFilter.exclude.getOrElse(List()).zipWithIndex.map(excludeWithIndex => {
      val bindingVariableName = s"${bindingVariableNamePrefix}Exclude${excludeWithIndex._2}"
      CypherFilter(binding = Some(CypherBinding(variableName = bindingVariableName, value = excludeWithIndex._1)), cypher = s"NOT ${property} = $$${bindingVariableName}")
    }) ++
      stringFilter.include.getOrElse(List()).zipWithIndex.map(includeWithIndex => {
        val bindingVariableName = s"${bindingVariableNamePrefix}Include${includeWithIndex._2}"
        CypherFilter(binding = Some(CypherBinding(variableName = bindingVariableName, value = includeWithIndex._1)), cypher = s"${property} = $$${bindingVariableName}")
      })
  }
}

@Singleton
final class Neo4jStore @Inject()(configuration: Neo4jStoreConfiguration) extends Store with WithResource {
  private var bootstrapped: Boolean = false
  private val driver = GraphDatabase.driver(configuration.uri, AuthTokens.basic(configuration.user, configuration.password))
  private val edgePropertyNameList = List("datasource", "other", "weight")
  private val edgePropertyNamesString = edgePropertyNameList.map(edgePropertyName => "edge." + edgePropertyName).mkString(", ")
  private val logger = LoggerFactory.getLogger(getClass)
  private val nodePropertyNameList = List("aliases", "datasource", "id", "label", "other", "pos")
  private val nodePropertyNamesString = nodePropertyNameList.map(nodePropertyName => "node." + nodePropertyName).mkString(", ")

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
          """CALL db.index.fulltext.createNodeIndex("node",["Node"],["datasource", "id", "label"]);""",
          """CREATE CONSTRAINT node_id_constraint ON (n:Node) ASSERT n.id IS UNIQUE;"""
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
    withSession { session =>
      session.writeTransaction { transaction =>
        transaction.run(
          """CALL apoc.periodic.iterate("MATCH (n) return n", "DELETE n", {batchSize:1000})
            |YIELD batches, total RETURN batches, total
            |""".stripMargin)
        transaction.commit()
      }
    }
  }

  override final def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[Edge] = {
    withSession { session =>
      session.readTransaction { transaction => {
        val result =
          transaction.run(
            s"""
               |MATCH (subject:Node)-[edge]->(object:Node {id: $$objectNodeId})
               |RETURN type(edge), object.id, subject.id, ${edgePropertyNamesString}
               |ORDER BY type(edge), subject.id, edge
               |SKIP ${offset}
               |LIMIT ${limit}
               |""".stripMargin,
            Map(
              "objectNodeId" -> objectNodeId
            ).asJava.asInstanceOf[java.util.Map[String, Object]]
          )
        getEdgesFromRecords(result)
      }
      }
    }
  }


  override final def getEdgesBySubject(limit: Int, offset: Int, subjectNodeId: String): List[Edge] = {
    withSession { session =>
      session.readTransaction { transaction => {
        val result =
          transaction.run(
            s"""
               |MATCH (subject:Node {id: $$subjectNodeId})-[edge]->(object:Node)
               |RETURN type(edge), object.id, subject.id, ${edgePropertyNamesString}
               |ORDER BY type(edge), object.id, edge
               |SKIP ${offset}
               |LIMIT ${limit}
               |""".stripMargin,
            Map(
              "subjectNodeId" -> subjectNodeId
            ).asJava.asInstanceOf[java.util.Map[String, Object]]
          )
        getEdgesFromRecords(result)
      }
      }
    }
  }

  final override def getMatchingNodes(filters: Option[NodeFilters], limit: Int, offset: Int, text: String): List[Node] = {
    val cypherFilters = CypherFilters(filters)

    withSession { session =>
      session.readTransaction { transaction =>
        val result =
          transaction.run(
            s"""CALL db.index.fulltext.queryNodes("node", $$text) YIELD node, score
               |${cypherFilters.toCypherString}
               |RETURN ${nodePropertyNamesString}
               |SKIP ${offset}
               |LIMIT ${limit}
               |""".stripMargin,
            (Map(
              "text" -> text
            ) ++ cypherFilters.toCypherBindingsMap).asJava.asInstanceOf[java.util.Map[String, Object]]
          )
        getNodesFromRecords(result)
      }
    }
  }

  final override def getMatchingNodesCount(filters: Option[NodeFilters], text: String): Int = {
    val cypherFilters = CypherFilters(filters)

    withSession { session =>
      session.readTransaction { transaction =>
        val result =
          transaction.run(
            s"""CALL db.index.fulltext.queryNodes("node", $$text) YIELD node, score
               |${cypherFilters.toCypherString}
               |RETURN COUNT(node)
               |""".stripMargin,
            (Map(
              "text" -> text
            ) ++ cypherFilters.toCypherBindingsMap).asJava.asInstanceOf[java.util.Map[String, Object]]
          )
        val record = result.single()
        record.get("COUNT(node)").asInt()
      }
    }
  }

  override final def getNodeById(id: String): Option[Node] = {
    withSession { session =>
      session.readTransaction { transaction => {
        val result =
          transaction.run(
            s"MATCH (node:Node {id: $$id}) RETURN ${nodePropertyNamesString};",
            Map("id" -> id).asJava.asInstanceOf[java.util.Map[String, Object]]
          )
        val nodes = getNodesFromRecords(result)
        nodes.headOption
      }
      }
    }
  }

  private def getEdgeFromRecord(record: Record): Edge = {
    val recordMap = record.asMap().asScala.toMap.asInstanceOf[Map[String, Object]]
    Edge(
      datasource = recordMap("edge.datasource").asInstanceOf[String],
      `object` = recordMap("object.id").asInstanceOf[String],
      other = Option(recordMap("edge.other")).map(other => other.asInstanceOf[String]),
      predicate = recordMap("type(edge)").asInstanceOf[String],
      subject = recordMap("subject.id").asInstanceOf[String],
      weight = Option(recordMap("edge.weight")).map(weight => weight.asInstanceOf[Double].floatValue())
    )
  }

  private def getEdgesFromRecords(result: Result): List[Edge] =
    result.asScala.toList.map(record => getEdgeFromRecord(record))

  final override def getDatasources: List[String] =
    withSession { session =>
      session.readTransaction { transaction =>
        val result =
          transaction.run("MATCH (node:Node) RETURN DISTINCT node.datasource AS datasources")
        val datasourceValues = result.asScala.toList.map(_.get("datasources").asString)
        // Returns list of datasource values which can contain multiple datasources
        // so need to extract unique datasources
        datasourceValues.flatMap(_.split(",")).distinct
      }
    }

  private def getNodeFromRecord(record: Record): Node = {
    val recordMap = record.asMap().asScala.toMap.asInstanceOf[Map[String, String]]
    Node(
      aliases = Option(recordMap("node.aliases")).map(aliases => aliases.split(' ').toList),
      datasource = recordMap("node.datasource"),
      id = recordMap("node.id"),
      label = recordMap("node.label"),
      other = Option(recordMap("node.other")),
      pos = Option(recordMap("node.pos"))
    )
  }

  private def getNodesFromRecords(result: Result): List[Node] =
    result.asScala.toList.map(record => getNodeFromRecord(record))

  override def getPaths: List[Path] = List()

  override def getPathById(id: String): Option[Path] = None

  final override def getRandomNode: Node =
    withSession { session =>
      session.readTransaction { transaction => {
        val result =
          transaction.run(
            s"MATCH (node:Node) RETURN ${nodePropertyNamesString}, rand() as rand ORDER BY rand ASC LIMIT 1"
          )
        val nodes = getNodesFromRecords(result)
        nodes.head
      }
      }
    }

  final override def getTotalEdgesCount: Int =
    withSession { session =>
      session.readTransaction { transaction =>
        val result = transaction.run("MATCH ()-[r]->() RETURN COUNT(r) as count")
        val record = result.single()
        record.get("count").asInt()
      }
    }

  final override def getTotalNodesCount: Int =
    withSession { session =>
      session.readTransaction { transaction =>
        val result = transaction.run("MATCH (n) RETURN COUNT(n) as count")
        val record = result.single()
        record.get("count").asInt()
      }
    }

  final def isEmpty: Boolean =
    withSession { session =>
      session.readTransaction { transaction =>
        val result = transaction.run("MATCH (n) RETURN n LIMIT 1;")
        !result.hasNext
      }
    }

  final override def putEdges(edges: Traversable[Edge]): Unit = {
    withSession { session =>
      session.writeTransaction { transaction =>
        for (edge <- edges) {
          //          CREATE (:Node { id: node.id, label: node.label, aliases: node.aliases, pos: node.pos, datasource: node.datasource, other: node.other });
          transaction.run(
            """MATCH (subject:Node {id: $subject}), (object:Node {id: $object})
              |CALL apoc.create.relationship(subject, $predicate, {datasource: $datasource, weight: toFloat($weight), other: $other}, object) YIELD rel
              |REMOVE rel.noOp
              |""".stripMargin,
            Map(
              "datasource" -> edge.datasource,
              "object" -> edge.`object`,
              "other" -> edge.other.getOrElse(null),
              "predicate" -> edge.predicate,
              "subject" -> edge.subject,
              "weight" -> edge.weight.getOrElse(null)
            ).asJava.asInstanceOf[util.Map[String, Object]]
          )
        }
        transaction.commit()
      }
    }
//    val storedEdgesCount = getTotalEdgesCount
//    if (storedEdgesCount != edges.size) {
//      throw new IllegalStateException(s"some edges were not put correctly: expected ${edges.size}, actual ${storedEdgesCount}")
//    }
  }

  final override def putNodes(nodes: Traversable[Node]): Unit = {
    withSession { session =>
      session.writeTransaction { transaction =>
        for (node <- nodes) {
          //          CREATE (:Node { id: node.id, label: node.label, aliases: node.aliases, pos: node.pos, datasource: node.datasource, other: node.other });
          transaction.run(
            "CREATE (:Node { id: $id, label: $label, aliases: $aliases, pos: $pos, datasource: $datasource, other: $other });",
            Map(
              "aliases" -> node.aliases.map(aliases => aliases.mkString(" ")).getOrElse(null),
              "datasource" -> node.datasource,
              "id" -> node.id,
              "label" -> node.label,
              "pos" -> node.pos.getOrElse(null),
              "other" -> node.other.getOrElse(null)
            ).asJava.asInstanceOf[java.util.Map[String, Object]]
          )
        }
        transaction.commit()
      }
    }
//    val storedNodesCount = getTotalNodesCount
//    if (storedNodesCount != nodes.size) {
//      throw new IllegalStateException(s"some nodes were not put correctly: expected ${nodes.size}, actual ${storedNodesCount}")
//    }
  }

  override def putPaths(paths: Traversable[Path]): Unit = {}

  private def withSession[V](f: Session => V): V =
    withResource[Session, V](driver.session())(f)
}
