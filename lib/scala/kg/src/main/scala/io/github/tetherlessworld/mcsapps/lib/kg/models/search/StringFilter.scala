package io.github.tetherlessworld.mcsapps.lib.kg.models.search

final case class StringFilter(exclude: Option[List[String]] = None, include: Option[List[String]] = None)
