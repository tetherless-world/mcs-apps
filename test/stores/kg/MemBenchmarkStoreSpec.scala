package stores.kg

import org.scalatest.WordSpec
import stores.benchmark.{BenchmarkStoreBehaviors, MemBenchmarkStore, TestBenchmarkData}

class MemBenchmarkStoreSpec extends WordSpec with BenchmarkStoreBehaviors {
  behave like store(new MemBenchmarkStore(TestBenchmarkData))
}
