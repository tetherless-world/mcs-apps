package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import java.net.InetAddress

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import io.github.tetherlessworld.mcsapps.lib.kg.stores.{KgCommandStore, KgCommandStoreBehaviors, KgQueryStore, KgStoreFactory, StoreTestMode}
import org.scalatest.{BeforeAndAfterAll, WordSpec}

class PostgresKgStoreSpec extends WordSpec with BeforeAndAfterAll with KgCommandStoreBehaviors {
  import scala.concurrent.ExecutionContext.Implicits.global

  val configProvider = new PostgresStoreConfigProvider()
  val command = new PostgresKgCommandStore(configProvider)
  val query = new PostgresKgQueryStore(configProvider)
  val postgresHostAddress = InetAddress.getByName("mcs-postgres").getHostAddress
  val inTestingEnvironment = System.getenv("CI") != null || postgresHostAddress != "128.113.12.49"

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

  private object PostgresKgStoreFactory extends KgStoreFactory {
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
      behave like commandStore(PostgresKgStoreFactory)
//      behave like queryStore(PostgresKgStoreFactory)
    }
  }
}
