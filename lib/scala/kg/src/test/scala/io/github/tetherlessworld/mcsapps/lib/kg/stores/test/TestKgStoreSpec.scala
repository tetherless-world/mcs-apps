package io.github.tetherlessworld.mcsapps.lib.kg.stores.test

import org.scalatest.{Matchers, WordSpec}

class TestKgStoreSpec extends WordSpec with Matchers {
  "Test store" can {
    "instantiate with data" in {
      val store = new TestKgStore()
      store.getTotalEdgesCount should be > 0
      store.getTotalNodesCount should be > 0
    }
  }
}
