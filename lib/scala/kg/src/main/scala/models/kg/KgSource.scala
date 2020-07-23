package models.kg

final case class KgSource(id: String, label: String)

object KgSource {
  val WellKnownSources: Map[String, KgSource] = Map(
    "CN" -> "ConceptNet",
    "portal_test_data" -> "Portal test data",
    "portal_test_data_secondary_0" -> "Portal test data secondary 0",
    "portal_test_data_secondary_1" -> "Portal test data secondary 1",
    "portal_test_data_secondary_2" -> "Portal test data secondary 2"
  ).map(entry => (entry._1, KgSource(id = entry._1, label = entry._2)))

  def apply(id: String): KgSource =
    WellKnownSources.getOrElse(id, KgSource(id = id, label = id))
}