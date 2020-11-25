package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import slick.basic.Capability
import slick.jdbc.{JdbcCapabilities}
import com.github.tminglei.slickpg._

trait ExtendedPostgresProfile extends ExPostgresProfile with PgArraySupport {
  override protected def computeCapabilities: Set[Capability] =
    super.computeCapabilities + JdbcCapabilities.insertOrUpdate

  override val api = ExtendedAPI

  object ExtendedAPI extends API with ArrayImplicits {
    implicit val strListTypeMapper = new SimpleArrayJdbcType[String]("text").to(_.toList)
  }
}

object ExtendedPostgresProfile extends ExtendedPostgresProfile