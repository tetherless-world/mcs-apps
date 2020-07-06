package models.graphql

import play.api.mvc.Request
import stores.Stores

final class GraphQlSchemaContext(request: Request[_], val stores: Stores)
