package io.github.tetherlessworld.mcsapps.lib.kg.stores.mem

import io.github.tetherlessworld.mcsapps.lib.kg.stores.test.TestKgStore
import io.github.tetherlessworld.mcsapps.lib.kg.stores._
import org.scalatest.WordSpec

class MemKgStoreSpec extends WordSpec with KgCommandStoreBehaviors with KgQueryStoreBehaviors {
  private object MemKgStoreFactory extends KgStoreFactory {
    override def apply(testMode: StoreTestMode)(f: (KgCommandStore, KgQueryStore) => Unit): Unit = {
      val store = new TestKgStore
      f(store, store)
    }
  }

  behave like commandStore(MemKgStoreFactory)
  behave like queryStore(MemKgStoreFactory)
}
