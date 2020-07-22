package stores.kg.mem

import org.scalatest.WordSpec
import stores.kg.KgStoreBehaviors
import stores.kg.test.TestKgStore

class MemKgStoreSpec extends WordSpec with KgStoreBehaviors {
  behave like store(() => new TestKgStore)
}
