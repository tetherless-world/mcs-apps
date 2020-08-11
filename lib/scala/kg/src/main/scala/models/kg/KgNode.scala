package models.kg

import stores.kg.KgNodeSortableField

final case class KgNode(
                         id: String,
                         labels: List[String],
                         pageRank: Option[Double],
                         pos: Option[String],
                         sourceIds: List[String]
                     ) {
  private val ListDelimChar = '|'
  private val ListDelimString = ListDelimChar.toString

  def getFieldString(field: KgNodeSortableField) =
    field match {
      case KgNodeSortableField.Id => this.id
      case KgNodeSortableField.Labels => this.labels.sorted.mkString(ListDelimString)
      case KgNodeSortableField.Sources => this.sourceIds.sorted.mkString(ListDelimString)
      case KgNodeSortableField.PageRank => this.pageRank.get.toString
    }
}