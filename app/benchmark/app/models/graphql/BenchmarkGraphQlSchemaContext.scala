package models.graphql

import play.api.mvc.Request
import stores.benchmark.BenchmarkStore
import stores.kg.KgQueryStore

final class BenchmarkGraphQlSchemaContext(val benchmarkStore: BenchmarkStore, kgQueryStore: KgQueryStore, request: Request[_]) extends KgGraphQlSchemaContext(kgQueryStore, request)
