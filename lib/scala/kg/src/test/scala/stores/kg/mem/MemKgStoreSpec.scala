package stores.kg.mem

import org.scalatest.WordSpec
import stores.kg.{KgStore, KgStoreBehaviors}
import stores.kg.test.TestKgStore

class MemKgStoreSpec extends WordSpec with KgStoreBehaviors {
  private object MemKgStoreFactory extends KgStoreFactory {
    override def apply(testMode: TestMode)(f: KgStore => Unit): Unit =
      f(new TestKgStore)
  }

  behave like store(MemKgStoreFactory)
}
