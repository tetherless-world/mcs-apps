package stores

import java.io.InputStreamReader

import models.cskg.{Edge, Node}

final class TestStore extends MemStore {
  putNodes(TestData.nodes)
  putEdges(TestData.edges)
  putPaths(TestData.paths)
}
