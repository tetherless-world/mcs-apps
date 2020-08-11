package stores.kg


object KgNodeSortableField extends Enumeration {
  type KgNodeSortableField = Value
  val Id = Value("id")
  val Labels = Value("labels")
  val Sources = Value("sources")
  val PageRank = Value("pageRank")
}
