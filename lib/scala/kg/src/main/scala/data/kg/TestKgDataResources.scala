package data.kg

object TestKgDataResources extends KgDataResources(
  edgesCsvBz2ResourceName = "/data/test/kg/edges.csv.bz2",
  nodesCsvBz2ResourceName = "/data/test/kg/nodes.csv.bz2",
  pathsJsonlResourceName = "/data/test/kg/paths.jsonl"
)
