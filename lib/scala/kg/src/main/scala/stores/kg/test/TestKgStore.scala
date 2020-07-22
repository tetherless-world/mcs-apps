package stores.kg.test

import data.kg.TestKgData
import stores.kg.mem.MemKgStore

final class TestKgStore extends MemKgStore {
  putNodes(TestKgData.nodes.iterator)
  putEdges(TestKgData.edges.iterator)
  putPaths(TestKgData.paths.iterator)
}
