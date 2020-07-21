package data.kg

import data.DataResource

object TestCskgCsvDataResources extends CskgCsvDataResources(
  edgesCsvBz2 = DataResource("/data/test/kg/legacy/edges.csv.bz2"),
  nodesCsvBz2 = DataResource("/data/test/kg/legacy/nodes.csv.bz2"),
  pathsJsonl = DataResource("/data/test/kg/paths.jsonl")
)
