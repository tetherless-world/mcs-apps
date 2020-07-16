package stores.kg

import data.kg.TestKgtkData

final class TestKgtkStore extends MemKgStore {
  putEdges(TestKgtkData.edges.iterator);
  putNodes(TestKgtkData.nodes.iterator);
  putPaths(TestKgtkData.paths.iterator);
}
