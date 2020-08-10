package stores.kg

import models.kg.KgNode
import stores.SortDirection
import stores.SortDirection.SortDirection
import stores.kg.KgNodeField.KgNodeField

final case class KgNodeSort(field: KgNodeField, direction: SortDirection)

object KgNodeSort {
  def apply(nodes: List[KgNode], sorts: List[KgNodeSort]): List[KgNode] = {
    if (sorts.isEmpty) nodes
    else KgNodeSort(nodes.sortBy(node => KgNodeField.getFieldString(node, sorts.last.field))(if (sorts.last.direction == SortDirection.Ascending) Ordering[String] else Ordering[String].reverse), sorts.init)
  }
}
