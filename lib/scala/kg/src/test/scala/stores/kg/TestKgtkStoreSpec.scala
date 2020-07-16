package stores.kg

import org.scalatest.{Matchers, WordSpec}

class TestKgtkStoreSpec extends WordSpec with Matchers {
  "Test store" can {
    "instantiate with data" in {
      val store = new TestKgtkStore()
      store.getTotalEdgesCount should be > 0
      store.getTotalNodesCount should be > 0
    }
  }
}