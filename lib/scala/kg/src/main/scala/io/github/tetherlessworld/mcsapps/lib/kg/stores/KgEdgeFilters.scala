package io.github.tetherlessworld.mcsapps.lib.kg.stores

final case class KgEdgeFilters(
                                objectId: Option[String] = None,
                                objectLabel: Option[String] = None,
                                subjectId: Option[String] = None,
                                subjectLabel: Option[String] = None
                              )
