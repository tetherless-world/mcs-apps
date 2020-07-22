package stores.kg.neo4j

final case class CypherWithBinding(cypher: String, binding: Option[CypherBinding] = None)
