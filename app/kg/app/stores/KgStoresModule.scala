package stores

import com.google.inject.AbstractModule
import data.kg.KgDataDirectoryLoader
import org.slf4j.LoggerFactory
import stores.kg.neo4j.Neo4jKgStore
import stores.kg.KgStore
import stores.kg.test.TestKgStore

final class KgStoresModule extends AbstractModule {
  private val logger = LoggerFactory.getLogger(classOf[KgStoresModule])

  override def configure(): Unit = {
    val useTestStores = System.getProperty("testIntegration") != null
    if (useTestStores) {
      logger.info("using test stores for integration testing")
    }
    bind(classOf[KgStore]).to(if (useTestStores) classOf[TestKgStore] else classOf[Neo4jKgStore])

    bind(classOf[KgDataDirectoryLoader]).asEagerSingleton()
  }
}
