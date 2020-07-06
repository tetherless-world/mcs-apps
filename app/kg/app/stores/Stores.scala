package stores

import javax.inject.{Inject, Singleton}
import stores.benchmark.BenchmarkStore
import stores.kg.KgStore

@Singleton
final class Stores @Inject() (val benchmarkStore: BenchmarkStore, val kgStore: KgStore)
