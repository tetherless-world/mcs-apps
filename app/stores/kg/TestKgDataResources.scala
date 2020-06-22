package stores.kg

object TestKgDataResources extends KgDataResources(
  edgesCsvBz2ResourceName = "/test_data/kg/edges.csv.bz2",
  nodesCsvBz2ResourceName = "/test_data/kg/nodes.csv.bz2",
  pathsJsonlResourceName = "/test_data/kg/paths.jsonl"
)
