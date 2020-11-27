package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import com.typesafe.config.Config
import io.github.tetherlessworld.mcsapps.lib.kg.stores.SlickDatabaseConfigProvider

trait PostgresStoreConfigProvider extends SlickDatabaseConfigProvider[ExtendedPostgresProfile]

object PostgresStoreConfigProvider {
  def apply() = new SlickDatabaseConfigProvider[ExtendedPostgresProfile]("postgres") with PostgresStoreConfigProvider
  def apply(path: String, config: Config) = new SlickDatabaseConfigProvider[ExtendedPostgresProfile](path, config) with PostgresStoreConfigProvider
}
