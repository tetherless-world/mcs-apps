package stores

import io.github.tetherlessworld.mcsapps.lib.benchmark.data.TestBenchmarkData
import org.scalatest.WordSpec

class MemBenchmarkStoreSpec extends WordSpec with BenchmarkStoreBehaviors {
  behave like store(new MemBenchmarkStore(TestBenchmarkData))
}
