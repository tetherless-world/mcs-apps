package stores.kg.neo4j

import java.net.InetAddress

import data.kg.TestKgData
import org.scalatest.{BeforeAndAfterAll, BeforeAndAfterEach, WordSpec}
import org.slf4j.LoggerFactory
import stores.Neo4jStoreConfiguration
import stores.kg.{KgStore, KgStoreBehaviors}

class Neo4jKgStoreSpec extends WordSpec with KgStoreBehaviors with BeforeAndAfterAll {
  val logger = LoggerFactory.getLogger(getClass)
  val sut = new Neo4jKgStore(new Neo4jStoreConfiguration(commitInterval = Neo4jStoreConfiguration.CommitIntervalDefault, password = "nC1aB4mji623s2Zs", uri = "bolt://mcs-neo4j:7687", user = "neo4j"))
  val neo4jHostAddress = InetAddress.getByName("mcs-neo4j").getHostAddress
  val inTestingEnvironment = System.getenv("CI") != null || neo4jHostAddress != "128.113.12.49"

  override def beforeAll(): Unit = {
    if (!inTestingEnvironment) {
      return
    }
    resetSut()
  }

  private def resetSut(): Unit = {
    if (!sut.isEmpty) {
      sut.clear()
    }
    sut.putData(TestKgData)
  }

  private object Neo4jKgStoreFactory extends KgStoreFactory {
    override def apply(testMode: TestMode)(f: KgStore => Unit): Unit = {
      try {
        f(sut)
      } finally {
        if (testMode == TestMode.ReadWrite) {
          resetSut()
        }
      }
    }
  }

  if (inTestingEnvironment) {
    "The neo4j store" can {
        behave like store(Neo4jKgStoreFactory)
      }
  }
}
