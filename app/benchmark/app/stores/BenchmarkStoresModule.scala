package stores

import com.google.inject.AbstractModule
import io.github.tetherlessworld.mcsapps.lib.kg.stores.KgStoresModule
import org.slf4j.LoggerFactory
import play.api.{Configuration, Environment}

final class BenchmarkStoresModule(environment: Environment, configuration: Configuration) extends AbstractModule {
  private val logger = LoggerFactory.getLogger(classOf[BenchmarkStoresModule])

  override def configure(): Unit = {
    install(new KgStoresModule(environment, configuration))

    configuration.getOptional[String]("benchmarkStore").getOrElse("conf") match {
      case "test" => {
        logger.info("using test stores")
        bind(classOf[BenchmarkStore]).to(classOf[TestBenchmarkStore])
      }
      case _ => {
        bind(classOf[BenchmarkStore]).to(classOf[ConfBenchmarkStore])
      }
    }
  }
}
