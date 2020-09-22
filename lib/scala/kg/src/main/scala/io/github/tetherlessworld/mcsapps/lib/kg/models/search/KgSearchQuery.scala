package io.github.tetherlessworld.mcsapps.lib.kg.models.search

final case class KgSearchQuery(filters: Option[KgSearchFilters], text: Option[String])
