package stores.kg

trait KgCommandStore {
  def transaction: KgCommandStoreTransaction
}

