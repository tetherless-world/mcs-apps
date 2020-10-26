package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.PostgresProfile


abstract class AbstractPostgresKgStore(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[PostgresProfile] {
  import profile.api._

  lazy val KgNodes = TableQuery[KgNodeTable]
  lazy val KgEdges = TableQuery[KgEdgeTable]
  lazy val KgSources = TableQuery[KgSourceTable]

  private class KgNodeTable(tag: Tag) extends Table[(String, Option[Char], Option[Int])](tag, "kg_node") {

    def id = column[String]("id", O.PrimaryKey)

    //    def inDegree = column[Option[Int]]("IN_DEGREE")
    //    def labels = column[String]("LABELS")
    //    def outDegree = column[Option[Int]]("OUT_DEGREE")
    //    def pageRank = column[Option[Double]]("PAGERANK")
    def pos = column[Option[Char]]("pos")

    //    def sourceIds = column[String]("SOURCE_IDS")
    def wordNetSenseNumber = column[Option[Int]]("word_net_sense_number")

    def * = (id, pos, wordNetSenseNumber)
  }

  private class KgEdgeTable(tag: Tag) extends Table[(String, String, String, String)](tag, "kg_edge") {
    def id = column[String]("id", O.PrimaryKey)
//    labels: List[String],
    def objectNodeId = column[String]("object_node_id")
    def predicate = column[String]("predicate")
//    sentences: List[String],
//    sourceIds: List[String],
    def subjectNodeId = column[String]("subject_node_id")

    def * = (id, objectNodeId, predicate, subjectNodeId)

    def objectNode = foreignKey("object_node_fk", objectNodeId, KgNodes)(_.id)
    def subjectNode = foreignKey("subject_node_fk", subjectNodeId, KgNodes)(_.id)

  }

  private class KgSourceTable(tag: Tag) extends Table[(String, String)](tag, "kg_source") {
    def id = column[String]("id", O.PrimaryKey)
    def label = column[String]("label")

    def * = (id, label)
  }

  private class KgNodeKgSource(tag: Tag) extends Table[(Int, String, String)](tag, "kg_node_kg_source") {
    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)

    def kgNodeId = column[String]("kg_node_id")
    def kgSourceId = column[String]("kg_source_id")

    def * = (id, kgNodeId, kgSourceId)

    def kgNode = foreignKey("kg_node_fk", kgNodeId, KgNodes)(_.id)
    def kgSource = foreignKey("kg_source_fk", kgSourceId, KgSources)(_.id)
  }
}
