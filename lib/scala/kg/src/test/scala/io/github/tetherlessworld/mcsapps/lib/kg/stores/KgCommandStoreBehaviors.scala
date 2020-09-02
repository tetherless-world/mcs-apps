package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import io.github.tetherlessworld.mcsapps.lib.kg.models.kg.KgNode
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import org.scalatest.{Matchers, WordSpec}

import scala.math.abs

trait KgCommandStoreBehaviors extends Matchers with WithResource {
  this: WordSpec =>

  def commandStore(storeFactory: KgStoreFactory) {
    "put and get sources" in {
      storeFactory(StoreTestMode.ReadWrite) { case (command, query) =>
        command.withTransaction {
          _.clear()
        }
        query.isEmpty should be(true)
        command.withTransaction {
          _.putSources(TestKgData.sources)
        }
        query.getSources.sortBy(_.id) should equal(TestKgData.sources.sortBy(_.id))
      }
    }
  }
}
