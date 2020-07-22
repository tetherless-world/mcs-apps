package models.kg

final case class KgSource(id: String, label: String)

object KgSource {
  val WellKnownSources: Map[String, KgSource] = Map(
    "CN" -> "ConceptNet",
    "portal_test_data" -> "Portal test data"
  ).map(entry => (entry._1, KgSource(id = entry._1, label = entry._2)))

  def apply(id: String): KgSource =
    WellKnownSources.getOrElse(id, KgSource(id = id, label = id))
}
