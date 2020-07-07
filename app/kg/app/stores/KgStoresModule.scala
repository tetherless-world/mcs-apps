package stores

import com.google.inject.AbstractModule
import org.slf4j.LoggerFactory
import stores.kg.{KgStore, Neo4jKgStore, TestKgStore}

final class KgStoresModule extends AbstractModule {
  private val logger = LoggerFactory.getLogger(classOf[KgStoresModule])

  override def configure(): Unit = {
    val useTestStores = System.getProperty("testIntegration") != null
    if (useTestStores) {
      logger.info("using test stores for integration testing")
    }
    bind(classOf[KgStore]).to(if (useTestStores) classOf[TestKgStore] else classOf[Neo4jKgStore])
  }
}
