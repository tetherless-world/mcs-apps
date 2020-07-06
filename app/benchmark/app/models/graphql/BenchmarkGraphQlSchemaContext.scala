package models.graphql

import play.api.mvc.Request
import stores.benchmark.BenchmarkStore
import stores.kg.KgStore

final class BenchmarkGraphQlSchemaContext(val benchmarkStore: BenchmarkStore, kgStore: KgStore, request: Request[_]) extends KgGraphQlSchemaContext(kgStore, request)
