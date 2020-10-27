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
  lazy val kgNodeLabelEdges = TableQuery[KgNodeLabelEdgeTable]
  lazy val kgNodeLabelEdgeKgSources = TableQuery[KgNodeLabelEdgeKgSourceTable]
  lazy val kgNodeLabelKgSource = TableQuery[KgNodeLabelKgSourceTable]
  lazy val kgNodeKgSources = TableQuery[KgNodeKgSourceTable]
  lazy val kgSources = TableQuery[KgSourceTable]

  private class KgEdgeTable(tag: Tag) extends Table[(String, String, String, String, String)](tag, "kg_edge") {
    def id = column[String]("id", O.PrimaryKey)
    def objectKgNodeId = column[String]("object_kg_node_id")
    def predicate = column[String]("predicate")
    def sentences = column[String]("sentences")
    def subjectKgNodeId = column[String]("subject_node_id")

    def * = (id, objectKgNodeId, predicate, sentences, subjectKgNodeId)

    def objectNode = foreignKey("object_kg_node_fk", objectKgNodeId, kgNodes)(_.id)
    def subjectNode = foreignKey("subject_kg_node_fk", subjectKgNodeId, kgNodes)(_.id)

    def unique_constraint = index("kg_edge_unique_idx", (objectKgNodeId, subjectKgNodeId, predicate), unique = true)
  }

  private class KgEdgeLabelTable(tag: Tag) extends Table[(String, String)](tag, "kg_edge_label") {
    def kgEdgeId = column[String]("kg_edge_id")
    def label = column[String]("label")

    def * = (kgEdgeId, label)

    def kgEdge = foreignKey("kg_edge_fk", kgEdgeId, kgEdges)(_.id)

    def pk = primaryKey("kg_edge_label_pk", (kgEdgeId, label))
  }

  private class KgEdgeKgSourceTable(tag: Tag) extends Table[(String, String)](tag, "kg_edge_kg_source") {
    def kgEdgeId = column[String]("kg_edge_id")
    def kgSourceId = column[String]("kg_source_id")

    def * = (kgEdgeId, kgSourceId)

    def kgEdge = foreignKey("kg_edge_fk", kgEdgeId, kgEdges)(_.id)

    def pk = primaryKey("kg_edge_kg_source_pk", (kgEdgeId, kgSourceId))
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

  private class KgNodeKgNodeLabelTable(tag: Tag) extends Table[(String, String)](tag, "kg_node_kg_node_label") {
    def kgNodeId = column[String]("kg_node_id")
    def label = column[String]("label")

    def * = (kgNodeId, label)

    def kgNode = foreignKey("kg_node_fk", kgNodeId, kgNodes)(_.id)

    def pk = primaryKey("kg_node_label_pk", (kgNodeId, label))
  }

  private class KgNodeKgSourceTable(tag: Tag) extends Table[(String, String)](tag, "kg_kg_node_source") {
    def kgNodeId = column[String]("kg_node_id")
    def kgSourceId = column[String]("kg_source_id")

    def * = (kgNodeId, kgSourceId)

    def kgNode = foreignKey("kg_node_fk", kgNodeId, kgNodes)(_.id)
    def kgSource = foreignKey("kg_source_fk", kgSourceId, kgSources)(_.id)

    def pk = primaryKey("kg_node_kg_source_pk", (kgNodeId, kgSourceId))
  }

  private class KgNodeLabelTable(tag: Tag) extends Table[(String, Option[Double])](tag, "kg_node_label") {
    def label = column[String]("label", O.PrimaryKey)
    def pageRank = column[Option[Double]]("page_rank")

    def * = (label, pageRank)
  }

  private class KgNodeLabelEdgeTable(tag: Tag) extends Table[(Int, String, String)](tag, "kg_node_label_edge") {
    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def objectKgNodeLabelLabel = column[String]("object_kg_node_label_label")
    def subjectKgNodeLabelLabel = column[String]("subject_kg_node_label_label")

    def * = (id, objectKgNodeLabelLabel, subjectKgNodeLabelLabel)

    def objectKgNodeLabel = foreignKey("object_kg_node_label_fk", objectKgNodeLabelLabel, kgNodeLabels)(_.label)
    def subjectKgNodeLabel = foreignKey("subject_kg_node_label_fk", subjectKgNodeLabelLabel, kgNodeLabels)(_.label)

    def unique_constraint = index("kg_node_label_edge_unique_idx", (objectKgNodeLabelLabel, subjectKgNodeLabelLabel), unique = true)
  }

  private class KgNodeLabelEdgeKgSourceTable(tag: Tag) extends Table[(Int, String)](tag, "kg_node_label_edge_kg_source") {
    def kgNodeLabelEdgeId = column[Int]("kg_node_label_edge_id")
    def kgSourceId = column[String]("kg_source_id")

    def * = (kgNodeLabelEdgeId, kgSourceId)

    def kgNodeLabelEdge = foreignKey("kg_node_label_edge_fk", kgNodeLabelEdgeId, kgNodeLabelEdges)(_.id)
    def kgSource = foreignKey("kg_source_fk", kgSourceId, kgSources)(_.id)

    def pk = primaryKey("kg_node_label_edge_kg_source_pk", (kgNodeLabelEdgeId, kgSourceId))
  }

  private class KgNodeLabelKgSourceTable(tag: Tag) extends Table[(String, String)](tag, "kg_node_label_kg_source") {
    def kgNodeLabelLabel = column[String]("kg_node_label_label")
    def kgSourceId = column[String]("kg_source_id")

    def * = (kgNodeLabelLabel, kgSourceId)

    def kgNodeLabel = foreignKey("kg_node_label_fk", kgNodeLabelLabel, kgNodeLabels)(_.label)
    def kgSource = foreignKey("kg_source_fk", kgSourceId, kgSources)(_.id)

    def pk = primaryKey("kg_node_label_kg_source_pk", (kgNodeLabelLabel, kgSourceId))
  }

  private class KgSourceTable(tag: Tag) extends Table[(String, String)](tag, "kg_source") {
    def id = column[String]("id", O.PrimaryKey)
    def label = column[String]("label")

    def * = (id, label)
  }
}
