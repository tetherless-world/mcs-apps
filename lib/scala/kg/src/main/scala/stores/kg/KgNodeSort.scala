package stores.kg

import stores.SortDirection

final case class KgNodeSort(field: KgNodeSortableField, direction: SortDirection)
