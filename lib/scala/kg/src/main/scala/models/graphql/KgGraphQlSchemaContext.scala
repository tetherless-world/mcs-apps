package models.graphql

import play.api.mvc.Request
import stores.kg.KgQueryStore

class KgGraphQlSchemaContext(val kgQueryStore: KgQueryStore, request: Request[_])
