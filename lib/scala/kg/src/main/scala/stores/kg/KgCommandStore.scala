package stores.kg

import io.github.tetherlessworld.twxplore.lib.base.WithResource

trait KgCommandStore {
  def beginTransaction: KgCommandStoreTransaction

  def withTransaction(f: (KgCommandStoreTransaction) => Unit): Unit = {
    new WithResource {
      withResource(beginTransaction) {
        f(_)
      }
    }
  }
}

