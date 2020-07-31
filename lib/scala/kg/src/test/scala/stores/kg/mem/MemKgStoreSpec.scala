package stores.kg.mem

import org.scalatest.WordSpec
import stores.kg.{KgCommandStore, KgQueryStore, KgStoreBehaviors}
import stores.kg.test.TestKgStore

class MemKgStoreSpec extends WordSpec with KgStoreBehaviors {
  private object MemKgStoreFactory extends KgStoreFactory {
    override def apply(testMode: TestMode)(f: (KgCommandStore, KgQueryStore) => Unit): Unit = {
      val store = new TestKgStore
      f(store, store)
    }
  }

  behave like store(MemKgStoreFactory)
}
