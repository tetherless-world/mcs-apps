package stores.benchmark

import org.scalatest.WordSpec

class MemBenchmarkStoreSpec extends WordSpec with BenchmarkStoreBehaviors {
  behave like store(new MemBenchmarkStore(TestBenchmarkData))
}
