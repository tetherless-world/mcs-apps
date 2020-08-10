package stores.kg

import models.kg.KgNode

object KgNodeField extends Enumeration {
  private val ListDelimChar = '|'
  private val ListDelimString = ListDelimChar.toString

  type KgNodeField = Value
  val Id = Value("id")
  val Labels = Value("labels")
  val Sources = Value("sources")
  val PageRank = Value("pageRank")

  def getFieldString(node: KgNode, field: KgNodeField): String =
    field match {
      case Id => node.id
      case Labels => node.labels.mkString(ListDelimString)
      case Sources => node.sourceIds.mkString(ListDelimString)
      case PageRank => node.pageRank.get.toString
    }
}
