package stores.kg

import java.net.InetAddress

import org.scalatest.{BeforeAndAfterAll, WordSpec}
import org.slf4j.LoggerFactory
import stores.Neo4jStoreConfiguration

class Neo4jKgStoreSpec extends WordSpec with KgStoreBehaviors with BeforeAndAfterAll {
  val logger = LoggerFactory.getLogger(getClass)
  val sut = new Neo4jStore(new Neo4jStoreConfiguration(password = "nC1aB4mji623s2Zs", uri = "bolt://neo4j:7687", user = "neo4j"))
  val neo4jHostAddress = InetAddress.getByName("neo4j").getHostAddress
  val inTestingEnvironment = System.getenv("CI") != null || neo4jHostAddress != "128.113.12.49"

  override def beforeAll(): Unit = {
    if (!inTestingEnvironment) {
      return
    }
    if (!sut.isEmpty) {
      sut.clear()
    }
    sut.putNodes(KgTestData.nodes)
    sut.putEdges(KgTestData.edges)
    sut.putPaths(KgTestData.paths)
  }

  if (inTestingEnvironment) {
    "The neo4j store" can {
        behave like store(sut)
      }
  }
}
