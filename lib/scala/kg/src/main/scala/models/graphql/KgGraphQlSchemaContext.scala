package models.graphql

import play.api.mvc.Request
import stores.kg.KgStore

class KgGraphQlSchemaContext(val kgStore: KgStore, request: Request[_])
