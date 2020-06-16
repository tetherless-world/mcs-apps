package stores.kg

final class TestKgStore extends MemKgStore {
  putNodes(KgTestData.nodes.iterator)
  putEdges(KgTestData.edges.iterator)
  putPaths(KgTestData.paths.iterator)
}
