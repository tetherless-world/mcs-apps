package stores.kg

import org.scalatest.WordSpec

class MemKgStoreSpec extends WordSpec with KgStoreBehaviors {
  behave like store(() => new TestKgStore)
}
