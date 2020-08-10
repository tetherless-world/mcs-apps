package stores.kg

object KgNodeField extends Enumeration {
  type KgNodeField = Value
  val Id = Value("id")
  val Label = Value("label")
  val Source = Value("source")
  val PageRank = Value("pageRank")
}
