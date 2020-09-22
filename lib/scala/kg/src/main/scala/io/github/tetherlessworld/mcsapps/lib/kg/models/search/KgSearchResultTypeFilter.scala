package io.github.tetherlessworld.mcsapps.lib.kg.models.search

final case class KgSearchResultTypeFilter(exclude: Option[List[KgSearchResultType]] = None, include: Option[List[KgSearchResultType]] = None)
