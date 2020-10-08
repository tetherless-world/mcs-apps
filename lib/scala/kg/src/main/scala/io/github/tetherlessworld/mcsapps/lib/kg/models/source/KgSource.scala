package io.github.tetherlessworld.mcsapps.lib.kg.models.source

final case class KgSource(id: String, label: String)

object KgSource {
  val WellKnownSources: Map[String, KgSource] = Map(
    "AT" -> "Atomic",
    "CN" -> "ConceptNet",
    "FN" -> "FrameNet",
    "RG" -> "Roget",
    "VG" -> "Visual Genome",
    "WD" -> "Wikidata",
    "WN" -> "WordNet",
    "P0" -> "Test data 0",
    "P1" -> "Test data 1",
    "P2" -> "Test data 2",
    "P3" -> "Test data 3"
  ).map(entry => (entry._1, KgSource(id = entry._1, label = entry._2)))

  def apply(id: String): KgSource =
    WellKnownSources.getOrElse(id, KgSource(id = id, label = id))
}
