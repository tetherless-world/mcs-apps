package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.PostgresProfile


abstract class AbstractPostgresKgStore(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[PostgresProfile] {
  import profile.api._

  lazy val kgEdges = TableQuery[KgEdgeTable]
  lazy val kgEdgeLabels = TableQuery[KgEdgeLabelTable]
  lazy val kgEdgeKgSources = TableQuery[KgEdgeKgSourceTable]
  lazy val kgNodes = TableQuery[KgNodeTable]
  lazy val kgNodeLabels = TableQuery[KgNodeLabelTable]
  lazy val kgNodeKgSources = TableQuery[KgNodeKgSourceTable]
  lazy val kgSources = TableQuery[KgSourceTable]

  private class KgEdgeTable(tag: Tag) extends Table[(String, String, String, String, String)](tag, "kg_edge") {
    def id = column[String]("id", O.PrimaryKey)
    def objectNodeId = column[String]("object_node_id")
    def predicate = column[String]("predicate")
    def sentences = column[String]("sentences")
    def subjectNodeId = column[String]("subject_node_id")

    def * = (id, objectNodeId, predicate, sentences, subjectNodeId)

    def objectNode = foreignKey("object_node_fk", objectNodeId, kgNodes)(_.id)
    def subjectNode = foreignKey("subject_node_fk", subjectNodeId, kgNodes)(_.id)

    def unique_constraint = index("idx_kg_edge_unique", (objectNodeId, subjectNodeId, predicate), unique = true)
  }

  private class KgEdgeLabelTable(tag: Tag) extends Table[(String, String)](tag, "kg_edge_label") {
    def kgEdgeId = column[String]("kg_edge_id")
    def label = column[String]("label")

    def * = (kgEdgeId, label)

    def kgEdge = foreignKey("kg_edge_fk", kgEdgeId, kgEdges)(_.id)

    def pk = primaryKey("pk_kg_edge_label", (kgEdgeId, label))
  }

  private class KgEdgeKgSourceTable(tag: Tag) extends Table[(String, String)](tag, "kg_edge_kg_source") {
    def kgEdgeId = column[String]("kg_edge_id")
    def kgSourceId = column[String]("kg_source_id")

    def * = (kgEdgeId, kgSourceId)

    def kgEdge = foreignKey("kg_edge_fk", kgEdgeId, kgEdges)(_.id)

    def pk = primaryKey("pk_kg_edge_kg_source", (kgEdgeId, kgSourceId))
  }

  private class KgNodeTable(tag: Tag) extends Table[(String, Option[Short], Option[Short], Option[Double], Option[Char], Option[Short])](tag, "kg_node") {
    def id = column[String]("id", O.PrimaryKey)
    def inDegree = column[Option[Short]]("in_degree")
    def outDegree = column[Option[Short]]("out_degree")
    def pageRank = column[Option[Double]]("page_rank")
    def pos = column[Option[Char]]("pos", O.Length(1))
    def wordNetSenseNumber = column[Option[Short]]("word_net_sense_number")

    def * = (id, inDegree, outDegree, pageRank, pos, wordNetSenseNumber)
  }

  private class KgNodeLabelTable(tag: Tag) extends Table[(String, String)](tag, "kg_node_label") {
    def kgNodeId = column[String]("kg_node_id")
    def label = column[String]("label")

    def * = (kgNodeId, label)

    def kgNode = foreignKey("kg_node_fk", kgNodeId, kgNodes)(_.id)

    def pk = primaryKey("pk_kg_node_label", (kgNodeId, label))
  }

  private class KgNodeKgSourceTable(tag: Tag) extends Table[(String, String)](tag, "kg_kg_node_source") {
    def kgNodeId = column[String]("kg_node_id")
    def kgSourceId = column[String]("kg_source_id")

    def * = (kgNodeId, kgSourceId)

    def kgNode = foreignKey("kg_node_fk", kgNodeId, kgNodes)(_.id)
    def kgSource = foreignKey("kg_source_fk", kgSourceId, kgSources)(_.id)

    def pk = primaryKey("pk_kg_node_kg_source", (kgNodeId, kgSourceId))
  }

  private class KgSourceTable(tag: Tag) extends Table[(String, String)](tag, "kg_source") {
    def id = column[String]("id", O.PrimaryKey)
    def label = column[String]("label")

    def * = (id, label)
  }
}
