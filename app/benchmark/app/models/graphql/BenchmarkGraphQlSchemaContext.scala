package models.graphql

import play.api.mvc.Request
import stores.benchmark.BenchmarkStore
import stores.kg.KgQueryStore

final class BenchmarkGraphQlSchemaContext(val benchmarkStore: BenchmarkStore, kgStore: KgQueryStore, request: Request[_]) extends KgGraphQlSchemaContext(kgStore, request)
