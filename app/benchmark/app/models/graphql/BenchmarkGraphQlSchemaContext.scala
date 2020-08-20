package models.graphql

import io.github.tetherlessworld.mcsapps.lib.kg.models.graphql.KgGraphQlSchemaContext
import io.github.tetherlessworld.mcsapps.lib.kg.stores.KgQueryStore
import play.api.mvc.Request
import stores.BenchmarkStore

final class BenchmarkGraphQlSchemaContext(val benchmarkStore: BenchmarkStore, kgQueryStore: KgQueryStore, request: Request[_]) extends KgGraphQlSchemaContext(kgQueryStore, request)
