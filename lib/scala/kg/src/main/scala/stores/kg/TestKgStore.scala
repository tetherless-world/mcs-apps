package stores.kg

import data.kg.TestKgData

final class TestKgStore extends MemKgStore {
  putNodes(TestKgData.nodes.iterator)
  putEdges(TestKgData.edges.iterator)
  putPaths(TestKgData.paths.iterator)
}
