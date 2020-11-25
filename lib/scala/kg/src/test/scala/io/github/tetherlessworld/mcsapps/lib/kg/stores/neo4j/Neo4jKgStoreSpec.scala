package io.github.tetherlessworld.mcsapps.lib.kg.stores.neo4j

import java.net.InetAddress

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import io.github.tetherlessworld.mcsapps.lib.kg.stores._
import org.scalatest.{BeforeAndAfterAll, WordSpec}
import org.slf4j.LoggerFactory

class Neo4jKgStoreSpec extends WordSpec with BeforeAndAfterAll with KgCommandStoreBehaviors with KgQueryStoreBehaviors {
  val logger = LoggerFactory.getLogger(getClass)
  val configuration =
    new Neo4jStoreConfiguration(
      password = "nC1aB4mji623s2Zs",
      uri = "bolt://mcs-neo4j:7687",
      user = "neo4j"
    )
  val command = new Neo4jKgCommandStore(configuration)
  val query = new Neo4jKgQueryStore(configuration)
  val neo4jHostAddress = InetAddress.getByName("mcs-neo4j").getHostAddress
  val inTestingEnvironment = System.getenv("CI") != null || neo4jHostAddress != "128.113.12.49"

  override def beforeAll(): Unit = {
    if (!inTestingEnvironment) {
      return
    }
    resetSut()
  }

  private def resetSut(): Unit = {
    if (!query.isEmpty) {
      command.withTransaction { _.clear() }
    }
    command.withTransaction { _.putData(TestKgData) }
  }

  private object Neo4jKgStoreFactory extends KgStoreFactory {
    override def apply(testMode: StoreTestMode)(f: (KgCommandStore, KgQueryStore) => Unit): Unit = {
      try {
        f(command, query)
      } finally {
        if (testMode == StoreTestMode.ReadWrite) {
          resetSut()
        }
      }
    }
  }

  if (inTestingEnvironment) {
    "The neo4j store" can {
        behave like commandStore(Neo4jKgStoreFactory)
        behave like queryStore(Neo4jKgStoreFactory)
      }
  }
}
