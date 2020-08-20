package stores

import com.google.inject.AbstractModule
import io.github.tetherlessworld.mcsapps.lib.kg
import io.github.tetherlessworld.mcsapps.lib.kg.stores.neo4j.{Neo4jKgCommandStore, Neo4jKgQueryStore}
import io.github.tetherlessworld.mcsapps.lib.kg.stores.test.TestKgStore
import io.github.tetherlessworld.mcsapps.lib.kg.stores.{KgCommandStore, KgDataDirectoryLoader, KgQueryStore}
import org.slf4j.LoggerFactory
import play.api.{Configuration, Environment}

final class KgStoresModule(environment: Environment, configuration: Configuration) extends AbstractModule {
  override def configure(): Unit = {
    install(new kg.stores.KgStoresModule(environment, configuration))
  }
}
