package io.github.tetherlessworld.mcsapps.lib.kg.stores.mem

import io.github.tetherlessworld.mcsapps.lib.kg.stores.{KgCommandStore, KgQueryStore, KgStoreBehaviors, StoreTestMode}
import org.scalatest.WordSpec
import io.github.tetherlessworld.mcsapps.lib.kg.stores.test.TestKgStore

class MemKgStoreSpec extends WordSpec with KgStoreBehaviors {
  private object MemKgStoreFactory extends KgStoreFactory {
    override def apply(testMode: StoreTestMode)(f: (KgCommandStore, KgQueryStore) => Unit): Unit = {
      val store = new TestKgStore
      f(store, store)
    }
  }

  behave like store(MemKgStoreFactory)
}
