package stores.kg

import stores.SortDirection.SortDirection
import stores.kg.KgNodeField.KgNodeField

case class KgNodeSort(field: KgNodeField, direction: SortDirection)
