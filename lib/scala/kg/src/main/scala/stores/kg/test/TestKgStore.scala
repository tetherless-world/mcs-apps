package stores.kg.test

import data.kg.TestKgData
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import stores.kg.mem.MemKgStore

final class TestKgStore extends MemKgStore with WithResource {
  withResource(beginTransaction) { _.putData(TestKgData) }
}
