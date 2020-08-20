package io.github.tetherlessworld.mcsapps.lib.kg.stores.test

import io.github.tetherlessworld.mcsapps.lib.kg.data.TestKgData
import io.github.tetherlessworld.twxplore.lib.base.WithResource
import io.github.tetherlessworld.mcsapps.lib.kg.stores.mem.MemKgStore

final class TestKgStore extends MemKgStore with WithResource {
  withResource(beginTransaction) { _.putData(TestKgData) }
}
