package io.github.tetherlessworld.mcsapps.lib.kg.stores.benchmark

import io.github.tetherlessworld.mcsapps.lib.kg.data.benchmark.TestBenchmarkData
import org.scalatest.WordSpec

class MemBenchmarkStoreSpec extends WordSpec with BenchmarkStoreBehaviors {
  behave like store(new MemBenchmarkStore(TestBenchmarkData))
}
