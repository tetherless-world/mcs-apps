package stores.kg

import models.kg.KgNode

object KgNodeSortableField extends Enumeration {
  private val ListDelimChar = '|'
  private val ListDelimString = ListDelimChar.toString

  type KgNodeSortableField = Value
  val Id = Value("id")
  val Labels = Value("labels")
  val Sources = Value("sources")
  val PageRank = Value("pageRank")

  def getFieldString(node: KgNode, field: KgNodeSortableField): String =
    field match {
      case Id => node.id
      case Labels => node.labels.mkString(ListDelimString)
      case Sources => node.sourceIds.mkString(ListDelimString)
      case PageRank => node.pageRank.get.toString
    }
}
