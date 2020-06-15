package models.graphql

import play.api.mvc.Request
import stores.Stores
import stores.kg.KgStore

final class GraphQlSchemaContext(request: Request[_], val stores: Stores)
