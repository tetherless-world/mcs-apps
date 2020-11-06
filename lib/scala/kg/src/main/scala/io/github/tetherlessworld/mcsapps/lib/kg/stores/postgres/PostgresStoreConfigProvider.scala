package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import com.typesafe.config.Config
import io.github.tetherlessworld.mcsapps.lib.kg.stores.SlickDatabaseConfigProvider
import slick.jdbc.PostgresProfile

trait PostgresStoreConfigProvider extends SlickDatabaseConfigProvider[PostgresProfile]

object PostgresStoreConfigProvider {
  def apply() = new SlickDatabaseConfigProvider[PostgresProfile]("postgres") with PostgresStoreConfigProvider
  def apply(path: String, config: Config) = new SlickDatabaseConfigProvider[PostgresProfile](path, config) with PostgresStoreConfigProvider
}
