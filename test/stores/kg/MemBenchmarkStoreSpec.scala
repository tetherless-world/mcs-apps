package stores.kg

import org.scalatest.WordSpec
import stores.benchmark.{BenchmarkStoreBehaviors, MemBenchmarkStore}

class MemBenchmarkStoreSpec extends WordSpec with BenchmarkStoreBehaviors {
  behave like store(new MemBenchmarkStore)
}
