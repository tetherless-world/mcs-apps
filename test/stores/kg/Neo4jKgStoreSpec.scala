package stores.kg

import java.net.InetAddress

import data.kg.TestKgData
import org.scalatest.{BeforeAndAfterAll, WordSpec}
import org.slf4j.LoggerFactory
import stores.Neo4jStoreConfiguration

class Neo4jKgStoreSpec extends WordSpec with KgStoreBehaviors with BeforeAndAfterAll {
  val logger = LoggerFactory.getLogger(getClass)
  val sut = new Neo4jKgStore(new Neo4jStoreConfiguration(commitInterval = Neo4jStoreConfiguration.CommitIntervalDefault, password = "nC1aB4mji623s2Zs", uri = "bolt://mcs-portal-neo4j:7687", user = "neo4j"))
  val neo4jHostAddress = InetAddress.getByName("mcs-portal-neo4j").getHostAddress
  val inTestingEnvironment = System.getenv("CI") != null || neo4jHostAddress != "128.113.12.49"

  override def beforeAll(): Unit = {
    if (!inTestingEnvironment) {
      return
    }
    if (!sut.isEmpty) {
      sut.clear()
    }
    sut.putNodes(TestKgData.nodes.iterator)
    sut.putEdges(TestKgData.edges.iterator)
    sut.putPaths(TestKgData.paths.iterator)
  }

  if (inTestingEnvironment) {
    "The neo4j store" can {
        behave like store(sut)
      }
  }
}
