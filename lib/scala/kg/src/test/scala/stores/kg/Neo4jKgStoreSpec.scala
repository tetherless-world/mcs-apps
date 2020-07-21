package stores.kg

import java.net.InetAddress

import data.kg.TestCskgCsvData
import org.scalatest.{BeforeAndAfterAll, WordSpec}
import org.slf4j.LoggerFactory
import stores.Neo4jStoreConfiguration

class Neo4jKgStoreSpec extends WordSpec with KgStoreBehaviors with BeforeAndAfterAll {
  val logger = LoggerFactory.getLogger(getClass)
  val sut = new Neo4jKgStore(new Neo4jStoreConfiguration(commitInterval = Neo4jStoreConfiguration.CommitIntervalDefault, password = "nC1aB4mji623s2Zs", uri = "bolt://mcs-neo4j:7687", user = "neo4j"))
  val neo4jHostAddress = InetAddress.getByName("mcs-neo4j").getHostAddress
  val inTestingEnvironment = System.getenv("CI") != null || neo4jHostAddress != "128.113.12.49"

  override def beforeAll(): Unit = {
    if (!inTestingEnvironment) {
      return
    }
    if (!sut.isEmpty) {
      sut.clear()
    }
    sut.putNodes(TestCskgCsvData.nodes.iterator)
    sut.putEdges(TestCskgCsvData.edges.iterator)
    sut.putPaths(TestCskgCsvData.paths.iterator)
  }

  if (inTestingEnvironment) {
    "The neo4j store" can {
        behave like store(sut)
      }
  }
}
