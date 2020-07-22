package stores.kg.neo4j

final case class CypherFilter(cypher: String, binding: Option[CypherBinding] = None)
