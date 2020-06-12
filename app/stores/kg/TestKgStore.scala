package stores.kg

final class TestKgStore extends MemKgStore {
  putNodes(KgTestData.nodes)
  putEdges(KgTestData.edges)
  putPaths(KgTestData.paths)
}
