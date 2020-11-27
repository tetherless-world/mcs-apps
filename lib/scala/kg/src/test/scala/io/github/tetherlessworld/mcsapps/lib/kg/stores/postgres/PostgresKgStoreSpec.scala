package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import java.net.InetAddress

import com.typesafe.config.ConfigFactory
import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import io.github.tetherlessworld.mcsapps.lib.kg.stores.{KgCommandStore, KgCommandStoreBehaviors, KgQueryStore, KgQueryStoreBehaviors, KgStoreFactory, StoreTestMode}
import org.scalatest.{BeforeAndAfterAll, WordSpec}

import scala.collection.JavaConverters.mapAsJavaMap

class PostgresKgStoreSpec extends WordSpec with BeforeAndAfterAll with KgCommandStoreBehaviors with KgQueryStoreBehaviors {
  import scala.concurrent.ExecutionContext.Implicits.global

  val testConfig = ConfigFactory.parseMap(mapAsJavaMap(Map(
//      "postgres.profile" -> "slick.jdbc.PostgresProfile$",
      "postgres.profile" -> "io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres.ExtendedPostgresProfile$",
      "postgres.db.connectionPool" -> "HikariCP",
      "postgres.db.driver" -> "org.postgresql.Driver",
      "postgres.db.password" -> "7EAdu7jJvZNxxrNZ",
      "postgres.db.url" -> "jdbc:postgresql://mcs-postgres:5432/kg",
      "postgres.db.user" -> "mcs"
  )))

  val configProvider = PostgresStoreConfigProvider("postgres", testConfig)
  val command = new PostgresKgCommandStore(configProvider)
  val query = new PostgresKgQueryStore(configProvider)
  val postgresHostAddress = InetAddress.getByName("mcs-postgres").getHostAddress
  val inTestingEnvironment = System.getenv("CI") != null || postgresHostAddress != "128.113.12.49"

  override def afterAll(): Unit = {
    configProvider.databaseConfig.db.close()
  }

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
    "The postgres store" can {
      behave like commandStore(PostgresKgStoreFactory)
      behave like queryStore(PostgresKgStoreFactory)
    }
  }
}
