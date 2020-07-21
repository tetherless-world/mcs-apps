package stores.kg

import data.kg.TestCskgCsvData

final class TestKgStore extends MemKgStore {
  putNodes(TestCskgCsvData.nodes.iterator)
  putEdges(TestCskgCsvData.edges.iterator)
  putPaths(TestCskgCsvData.paths.iterator)
}
