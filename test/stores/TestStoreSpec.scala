package stores

import java.io.InputStreamReader

import org.scalatest.{Matchers, WordSpec}

class TestStoreSpec extends WordSpec with Matchers {
  "Test store" can {
    "instantiate with data" in {
      val store = new TestStore()
      store.getTotalEdgesCount should be > 0
      store.getTotalNodesCount should be > 0
    }
  }
}
