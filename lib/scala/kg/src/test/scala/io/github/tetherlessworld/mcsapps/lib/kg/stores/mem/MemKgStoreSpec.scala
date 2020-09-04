package io.github.tetherlessworld.mcsapps.lib.kg.stores.mem

import io.github.tetherlessworld.mcsapps.lib.kg.stores.test.TestKgStore
import io.github.tetherlessworld.mcsapps.lib.kg.stores._
import org.scalatest.WordSpec

class MemKgStoreSpec extends WordSpec with KgCommandStoreBehaviors with KgQueryStoreBehaviors {
  private object MemKgStoreFactory extends KgStoreFactory {
    private var store = new TestKgStore

    override def apply(testMode: StoreTestMode)(f: (KgCommandStore, KgQueryStore) => Unit): Unit = {
      try {
        f(store, store)
      } finally {
        if (testMode == StoreTestMode.ReadWrite) {
          store = new TestKgStore
        }
      }
    }
  }

  behave like commandStore(MemKgStoreFactory)
  behave like queryStore(MemKgStoreFactory)
}
