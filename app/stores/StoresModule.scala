package stores

import com.google.inject.AbstractModule
import org.slf4j.LoggerFactory
import stores.benchmark.{BenchmarkStore, ConfBenchmarkStore, MemBenchmarkStore, TestBenchmarkStore}
import stores.kg.{KgStore, Neo4jStore, TestKgStore}

final class StoresModule extends AbstractModule {
  private val logger = LoggerFactory.getLogger(classOf[StoresModule])

  override def configure(): Unit = {
    val useTestStores = System.getProperty("testIntegration") != null
    if (useTestStores) {
      logger.info("using test stores for integration testing")
    }
    bind(classOf[BenchmarkStore]).to(if (useTestStores) classOf[TestBenchmarkStore] else classOf[ConfBenchmarkStore])
    bind(classOf[KgStore]).to(if (useTestStores) classOf[TestKgStore] else classOf[Neo4jStore])
  }
}
