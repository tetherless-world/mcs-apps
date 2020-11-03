package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import io.github.tetherlessworld.mcsapps.lib.kg.stores.SlickDatabaseConfigProvider
import javax.inject.Singleton
import slick.jdbc.PostgresProfile

@Singleton
final class PostgresStoreConfigProvider extends SlickDatabaseConfigProvider[PostgresProfile]("postgres")
