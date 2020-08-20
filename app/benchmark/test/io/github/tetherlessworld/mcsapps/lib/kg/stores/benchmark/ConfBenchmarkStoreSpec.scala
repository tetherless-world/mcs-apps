package io.github.tetherlessworld.mcsapps.lib.kg.stores.benchmark

import org.scalatest.{Matchers, WordSpec}

class ConfBenchmarkStoreSpec extends WordSpec with Matchers {
  "The ConfBenchmarkStore" must {
    "instantiate and not be empty" in {
      val store = new ConfBenchmarkStore()
      store.getBenchmarks should not be empty
    }
  }
}
