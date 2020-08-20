package io.github.tetherlessworld.mcsapps.lib.kg.models.graphql

import io.github.tetherlessworld.mcsapps.lib.kg.stores.KgQueryStore
import play.api.mvc.Request

class KgGraphQlSchemaContext(val kgQueryStore: KgQueryStore, request: Request[_])
