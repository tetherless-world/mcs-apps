package stores.benchmark

import data.benchmark.TestBenchmarkData
import org.scalatest.WordSpec

class MemBenchmarkStoreSpec extends WordSpec with BenchmarkStoreBehaviors {
  behave like store(new MemBenchmarkStore(TestBenchmarkData))
}
