package stores.kg.test

import data.kg.TestKgData
import stores.kg.mem.MemKgStore

final class TestKgStore extends MemKgStore {
  putData(TestKgData)
  writeNodePageRanks
}
