package io.github.tetherlessworld.mcsapps.lib.kg.models.search

import io.github.tetherlessworld.mcsapps.lib.kg.models.StringFacetFilter

final case class KgSearchFilters(
                                  sourceIds: Option[StringFacetFilter]
                                )
