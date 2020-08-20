package io.github.tetherlessworld.mcsapps.lib.kg.stores.neo4j

import java.net.InetAddress

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import org.scalatest.{BeforeAndAfterAll, BeforeAndAfterEach, WordSpec}
import org.slf4j.LoggerFactory
import io.github.tetherlessworld.mcsapps.lib.kg.stores.{KgCommandStore, KgQueryStore, KgStoreBehaviors, Neo4jStoreConfiguration}

class Neo4jKgStoreSpec extends WordSpec with KgStoreBehaviors with BeforeAndAfterAll {
  val logger = LoggerFactory.getLogger(getClass)
  val configuration = new Neo4jStoreConfiguration(commitInterval = Neo4jStoreConfiguration.CommitIntervalDefault, password = "nC1aB4mji623s2Zs", uri = "bolt://mcs-neo4j:7687", user = "neo4j")
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
    override def apply(testMode: TestMode)(f: (KgCommandStore, KgQueryStore) => Unit): Unit = {
      try {
        f(command, query)
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
