package stores.kg

import stores.TestData

final class TestKgStore extends MemKgStore {
  putNodes(TestData.nodes)
  putEdges(TestData.edges)
  putPaths(TestData.paths)
}
