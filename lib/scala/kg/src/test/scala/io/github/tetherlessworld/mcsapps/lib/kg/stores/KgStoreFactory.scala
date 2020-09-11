package io.github.tetherlessworld.mcsapps.lib.kg.stores

trait KgStoreFactory {
  def apply(testMode: StoreTestMode)(f: (KgCommandStore, KgQueryStore) => Unit)
}
