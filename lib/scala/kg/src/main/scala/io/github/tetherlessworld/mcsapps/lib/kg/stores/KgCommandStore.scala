package io.github.tetherlessworld.mcsapps.lib.kg.stores

import io.github.tetherlessworld.twxplore.lib.base.WithResource

trait KgCommandStore {
  def beginTransaction(): KgCommandStoreTransaction

  def withTransaction(f: (KgCommandStoreTransaction) => Unit): Unit = {
    new WithResource {
      withResource(beginTransaction) {
        f(_)
      }
    }
  }
}
