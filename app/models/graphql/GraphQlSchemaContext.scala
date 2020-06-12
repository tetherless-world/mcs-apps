package models.graphql

import play.api.mvc.Request
import stores.kg.KgStore

final class GraphQlSchemaContext(request: Request[_], val store: KgStore)
