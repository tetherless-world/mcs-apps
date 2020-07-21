package data.kg

import data.DataResource

object TestKgtkDataResources extends KgtkDataResources(
  edgesTsvBz2 = DataResource("/data/test/kg/kgtk/edges.tsv.bz2"),
  pathsJsonl = DataResource("/data/test/kg/paths.jsonl")
)
