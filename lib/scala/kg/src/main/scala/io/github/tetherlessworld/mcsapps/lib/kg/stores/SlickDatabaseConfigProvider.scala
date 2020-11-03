package io.github.tetherlessworld.mcsapps.lib.kg.stores


import slick.basic.{BasicProfile, DatabaseConfig}

import scala.reflect.ClassTag

trait HasDatabaseConfig[T <: BasicProfile] {
  protected val databaseConfig: DatabaseConfig[T]

  protected val profile: T = databaseConfig.profile
  protected val db: T#Backend#Database = databaseConfig.db
}

trait HasDatabaseConfigProvider[T <: BasicProfile] extends HasDatabaseConfig[T] {
  protected val databaseConfigProvider: SlickDatabaseConfigProvider[T]

  protected val databaseConfig = databaseConfigProvider.databaseConfig
}

class SlickDatabaseConfigProvider[T <: BasicProfile : ClassTag](val databaseConfig: DatabaseConfig[T]) {
  def this(path: String) =
    this(DatabaseConfig.forConfig[T](path))

}
