package io.github.tetherlessworld.mcsapps.lib.kg.stores


import slick.basic.{BasicProfile, DatabaseConfig}

trait HasDatabaseConfig[T <: BasicProfile] {
  val databaseConfig: DatabaseConfig[T]

  val profile: T = databaseConfig.profile
  val db: T#Backend#Database = databaseConfig.db
}

trait HasDatabaseConfigProvider[T <: BasicProfile] extends HasDatabaseConfig[T] {
  val databaseConfigProvider: SlickDatabaseConfigProvider[T]

  val databaseConfig = databaseConfigProvider.databaseConfig
}

class SlickDatabaseConfigProvider[T <: BasicProfile](val databaseConfig: DatabaseConfig[T]) {
  def this(path: String) =
    this(DatabaseConfig.forConfig[T](path))

}
