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
  private val objectNodePropertyNamesString = nodePropertyNameList.map(nodePropertyName => "objectNode." + nodePropertyName).mkString(", ")
  private val pathPropertyNameList = List("datasource", "id", "pathEdgeIndex", "pathEdgePredicate")
  private val pathPropertyNamesString = pathPropertyNameList.map(pathPropertyName => "path." + pathPropertyName).mkString(", ")
  private val subjectNodePropertyNamesString = nodePropertyNameList.map(nodePropertyName => "subjectNode." + nodePropertyName).mkString(", ")

  private implicit class RecordWrapper(record: Record) {
    def toEdge: Edge = {
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

    def toNode: Node = {
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
  }

  private implicit class ResultsWrapper(result: Result) {
    def toEdges: List[Edge] =
      result.asScala.toList.map(record => record.toEdge)

    def toNodes: List[Node] =
      result.asScala.toList.map(record => record.toNode)

    def toPaths: List[Path] = {
      while (result.hasNext) {
        val record = result.next()
        System.out.println(record.asMap())
      }
      List()
    }
  }

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

  override final def getEdgesByObject(limit: Int, objectNodeId: String, offset: Int): List[Edge] = {
    withSession { session =>
      session.readTransaction { transaction => {
        transaction.run(
          s"""
             |MATCH (subject:Node)-[edge]->(object:Node {id: $$objectNodeId})
             |RETURN type(edge), object.id, subject.id, ${edgePropertyNamesString}
             |ORDER BY type(edge), subject.id, edge
             |SKIP ${offset}
             |LIMIT ${limit}
             |""".stripMargin,
          queryParameters(Map(
            "objectNodeId" -> objectNodeId
          ))
        ).toEdges
      }
      }
    }
  }

  override final def getEdgesBySubject(limit: Int, offset: Int, subjectNodeId: String): List[Edge] = {
    withSession { session =>
      session.readTransaction { transaction => {
        transaction.run(
          s"""
             |MATCH (subject:Node {id: $$subjectNodeId})-[edge]->(object:Node)
             |RETURN type(edge), object.id, subject.id, ${edgePropertyNamesString}
             |ORDER BY type(edge), object.id, edge
             |SKIP ${offset}
             |LIMIT ${limit}
             |""".stripMargin,
          queryParameters(Map(
            "subjectNodeId" -> subjectNodeId
          ))
        ).toEdges
      }
      }
    }
  }

  final override def getMatchingNodes(filters: Option[NodeFilters], limit: Int, offset: Int, text: String): List[Node] = {
    val cypherFilters = CypherFilters(filters)

    withSession { session =>
      session.readTransaction { transaction =>
        transaction.run(
          s"""CALL db.index.fulltext.queryNodes("node", $$text) YIELD node, score
             |${cypherFilters.toCypherString}
             |RETURN ${nodePropertyNamesString}
             |SKIP ${offset}
             |LIMIT ${limit}
             |""".stripMargin,
          queryParameters(Map(
            "text" -> text
          ) ++ cypherFilters.toCypherBindingsMap)
        ).toNodes
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
            queryParameters(Map(
              "text" -> text
            ) ++ cypherFilters.toCypherBindingsMap)
          )
        val record = result.single()
        record.get("COUNT(node)").asInt()
      }
    }
  }

  override final def getNodeById(id: String): Option[Node] = {
    withSession { session =>
      session.readTransaction { transaction => {
        transaction.run(
          s"MATCH (node:Node {id: $$id}) RETURN ${nodePropertyNamesString};",
          queryParameters(Map("id" -> id))
        ).toNodes.headOption
      }
      }
    }
  }

  override def getPaths: List[Path] =
    withSession { session =>
      session.readTransaction { transaction =>
        transaction.run(
          s"""MATCH (subject:Node)-[path:PATH]->(object:Node)
            |RETURN ${objectNodePropertyNamesString}, ${subjectNodePropertyNamesString}, ${pathPropertyNamesString}
            |""".stripMargin
        ).toPaths
      }
    }

  override def getPathById(id: String): Option[Path] = {
    withSession { session =>
      session.readTransaction { transaction =>
        transaction.run(
          s"""MATCH (subject:Node)-[path:PATH {id: $id}]->(object:Node)
             |RETURN ${objectNodePropertyNamesString}, ${subjectNodePropertyNamesString}, ${pathPropertyNamesString}
             |""".stripMargin,
          queryParameters(Map("id" -> id))
        ).toPaths.headOption
      }
    }
  }

  final override def getRandomNode: Node =
    withSession { session =>
      session.readTransaction { transaction => {
        transaction.run(
          s"MATCH (node:Node) RETURN ${nodePropertyNamesString}, rand() as rand ORDER BY rand ASC LIMIT 1"
        ).toNodes.head
      }
      }
    }

  final override def getTotalEdgesCount: Int =
    withSession { session =>
      session.readTransaction { transaction =>
        transaction.run("MATCH ()-[r]->() RETURN COUNT(r) as count").single().get("count").asInt()
      }
    }

  final override def getTotalNodesCount: Int =
    withSession { session =>
      session.readTransaction { transaction =>
        transaction.run("MATCH (n) RETURN COUNT(n) as count").single().get("count").asInt()
      }
    }

  final def isEmpty: Boolean =
    withSession { session =>
      session.readTransaction { transaction =>
        transaction.run("MATCH (n) RETURN n LIMIT 1;").hasNext
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
            queryParameters(Map(
              "datasource" -> edge.datasource,
              "object" -> edge.`object`,
              "other" -> edge.other.getOrElse(null),
              "predicate" -> edge.predicate,
              "subject" -> edge.subject,
              "weight" -> edge.weight.getOrElse(null)
            ))
          )
        }
        transaction.commit()
      }
    }
  }

  private def queryParameters(map: Map[String, Any]) =
    map.asJava.asInstanceOf[java.util.Map[String, Object]]

  final override def putNodes(nodes: Traversable[Node]): Unit = {
    withSession { session =>
      session.writeTransaction { transaction =>
        for (node <- nodes) {
          //          CREATE (:Node { id: node.id, label: node.label, aliases: node.aliases, pos: node.pos, datasource: node.datasource, other: node.other });
          transaction.run(
            "CREATE (:Node { id: $id, label: $label, aliases: $aliases, pos: $pos, datasource: $datasource, other: $other });",
            queryParameters(Map(
              "aliases" -> node.aliases.map(aliases => aliases.mkString(" ")).getOrElse(null),
              "datasource" -> node.datasource,
              "id" -> node.id,
              "label" -> node.label,
              "pos" -> node.pos.getOrElse(null),
              "other" -> node.other.getOrElse(null)
            ))
          )
        }
        transaction.commit()
      }
    }
  }

  override def putPaths(paths: Traversable[Path]): Unit = {
    withSession { session =>
      session.writeTransaction { transaction =>
        for (path <- paths) {
          for (pathEdgeWithIndex <- path.edges.zipWithIndex) {
            val (pathEdge, pathEdgeIndex) = pathEdgeWithIndex
            transaction.run(
              """
                |MATCH (subject:Node), (object: Node)
                |WHERE subject.id = $subject AND object.id = $object
                |CREATE (subject)-[path:PATH {datasource: $pathDatasource, id: $pathId, pathEdgeIndex: $pathEdgeIndex, pathEdgePredicate: $pathEdgePredicate}]->(object)
                |""".stripMargin,
              queryParameters(Map(
                "object" -> pathEdge.`object`,
                "pathDatasource" -> path.datasource,
                "pathEdgeIndex" -> pathEdgeIndex,
                "pathId" -> path.id,
                "pathEdgePredicate" -> pathEdge.predicate,
                "subject" -> pathEdge.subject
              ))
            )
          }
        }
        transaction.commit()
      }
    }
  }

  private def withSession[V](f: Session => V): V =
    withResource[Session, V](driver.session())(f)
}
