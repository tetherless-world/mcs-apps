package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import io.github.tetherlessworld.mcsapps.lib.kg.stores.SlickDatabaseConfigProvider
import javax.inject.{Inject, Singleton}
import play.api.Configuration
import slick.jdbc.PostgresProfile

@Singleton
final class PostgresStoreConfigProvider(val dropTables: Boolean) extends SlickDatabaseConfigProvider[PostgresProfile]("postgres") {
  @Inject
  def this(configuration: Configuration) =
    this(configuration.getOptional[Boolean]("postgres.drop").getOrElse(false))
}
