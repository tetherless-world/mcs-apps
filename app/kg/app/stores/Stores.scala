package stores

import javax.inject.{Inject, Singleton}
import stores.kg.KgStore

@Singleton
final class Stores @Inject() (val kgStore: KgStore)
