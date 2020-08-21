package io.github.tetherlessworld.mcsapps.lib.kg.stores

final case class KgSearchQuery(filters: Option[KgSearchFilters], text: Option[String])
