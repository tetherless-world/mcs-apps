package io.github.tetherlessworld.mcsapps.lib.kg.stores.postgres

import slick.basic.Capability
import slick.jdbc.{JdbcCapabilities}
import com.github.tminglei.slickpg._

trait ExtendedPostgresProfile extends ExPostgresProfile {
  override protected def computeCapabilities: Set[Capability] =
    super.computeCapabilities + JdbcCapabilities.insertOrUpdate

  override val api = ExtendedAPI

  object ExtendedAPI extends API
}

object ExtendedPostgresProfile extends ExtendedPostgresProfile