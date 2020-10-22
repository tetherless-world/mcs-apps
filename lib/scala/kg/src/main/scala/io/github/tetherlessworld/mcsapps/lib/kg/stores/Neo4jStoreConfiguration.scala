package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.stores.Neo4jStoreConfiguration.{EnableDegreeCalculationDefault, EnablePageRankCalculationDefault}
import javax.inject.{Inject, Singleton}
import play.api.Configuration

@Singleton
final class Neo4jStoreConfiguration(
                                    val password: String,
                                    val uri: String,
                                    val user: String,
                                    val commitInterval: Int = Neo4jStoreConfiguration.CommitIntervalDefault,
                                    val enableDegreeCalculation: Boolean = EnableDegreeCalculationDefault,
                                    val enablePageRankCalculation: Boolean = EnablePageRankCalculationDefault
                                   ) {
  @Inject
  def this(configuration: Configuration) =
    this(
      commitInterval = configuration.getOptional[Int]("neo4j.commitInterval").getOrElse(Neo4jStoreConfiguration.CommitIntervalDefault),
      enableDegreeCalculation = configuration.getOptional[Boolean]("neo4j.enableDegreeCalculation").getOrElse(EnablePageRankCalculationDefault),
      enablePageRankCalculation = configuration.getOptional[Boolean]("neo4j.enablePageRankCalculation").getOrElse(EnablePageRankCalculationDefault),
      password = configuration.get[String]("neo4j.password"),
      uri = configuration.get[String]("neo4j.uri"),
      user = configuration.get[String]("neo4j.user")
    )
}

object Neo4jStoreConfiguration {
  val CommitIntervalDefault = 10000
  val EnableDegreeCalculationDefault = false
  val EnablePageRankCalculationDefault = true
}
